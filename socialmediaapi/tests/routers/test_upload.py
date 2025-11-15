import contextlib
import os
import pathlib
import tempfile

import pytest
from httpx import AsyncClient

# To test file uploads, we have 3rd party dependencies: b2sdk (for Backblaze B2) and aiofiles (for async file operations).
# We will mock these dependencies to avoid making actual network calls and file operations during tests.
# We do this because we are not testing the 3rd party libraries themselves, but rather our integration with them.
# We will assume that 3rd party libraries work as expected.

@pytest.fixture
def sample_image(fs) -> pathlib.Path:
#path = routers/assets/myfile.png: path of fake file
#.resolve() will give absolute path
    path = (pathlib.Path(__file__).parent / "assets" / "myfile.png").resolve() #__file__ will give path of current file and .parent will give folder "routers"
    fs.create_file(path)  # create the fake file in the fake filesystem
    return path

@pytest.fixture(autouse=True) #autouse=True coz we never want to upload actual file to B2 during tests
def mock_b2_upload_file(mocker):
#in routers/upload.py, we are importing b2_upload_file from socialmediaapi.libs.b2, so we need to mock that path
    mock_upload = mocker.patch(
        "socialmediaapi.routers.upload.b2_upload_file",
        return_value="https://fakeurl.com",
    )
    yield mock_upload
    
# we need to mock aiofile open now 
# as aiofile will try to read from physical file system whereas we want it to read from the fake file system provided by pyfakefs  
# normal file (not asynchronous) open is already mocked by pyfakefs, so we only need to mock aiofiles.open
# we will mock aiofile open to use normal open under the hood, so that pyfakefs can intercept it and use the fake filesystem
@pytest.fixture(autouse=True)
def aiofiles_mock_open(mocker, fs):
    mock_open = mocker.patch("aiofiles.open")
    
    @contextlib.asynccontextmanager
#here we will define what will happen when mock open is called
    async def async_file_open(fname: str, mode: str = "r"):
        # what does open return will be out_fs_mock for output file system (mock of open), so now aiofiles.open will return out_fs_mock
        out_fs_mock = mocker.AsyncMock(name=f"async_file_open:{fname!r}/{mode!r}")
        with open(fname, mode) as fin:
        # we are basically over writing aiofiles open's read and write methods to use normal open's read and write methods
            out_fs_mock.write.side_effect = fin.read  # when out_fs_mock.write is called, it will call fin.read from normal open
            out_fs_mock.read.side_effect = fin.write # when out_fs_mock.read is called, it will call fin.read from normal open
            yield out_fs_mock
            
    mock_open.side_effect = async_file_open
    return mock_open

async def call_upload_endpoint(
    async_client: AsyncClient,
    token: str,
    sample_image: pathlib.Path,
):
    return await async_client.post(
        "/upload",
        files = {"file": open(sample_image, "rb")},
        headers = {"Authorization": f"Bearer {token}"},   
    )
    
@pytest.mark.anyio
async def test_upload_image(
    async_client: AsyncClient,
    logged_in_token: str,
    sample_image: pathlib.Path,
):
    response = await call_upload_endpoint(
        async_client,
        logged_in_token,
        sample_image,
    )
    assert response.status_code == 201
    assert response.json()["file_url"] == "https://fakeurl.com"
    
@pytest.mark.anyio
async def test_temp_file_removed_after_upload(
    async_client: AsyncClient,
    logged_in_token: str,
    sample_image: pathlib.Path,
    mocker
):
#Spying wraps the real function but:still calls the real implementation
# records: calls, arguments, return values
    named_temp_file_spy = mocker.spy(tempfile, "NamedTemporaryFile")
    response = await call_upload_endpoint(
        async_client,
        logged_in_token,
        sample_image,
    )
    assert response.status_code == 201
#spy_return will give us the actual temp file that was created during the upload process

#spy was needed because our endpoint doesnt return the temp file name or path in the response, so we need to capture it using the spy
    created_temp_file = named_temp_file_spy.spy_return
    
    assert not os.path.exists(created_temp_file.name)

