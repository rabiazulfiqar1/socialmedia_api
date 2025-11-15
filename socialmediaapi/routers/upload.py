import logging
#the user uploaded file will be first stored in a temporary file on the server, then uploaded to B2, then deleted from the server
import tempfile

import aiofiles
from fastapi import APIRouter, UploadFile, HTTPException, status
from socialmediaapi.libs.b2 import b2_upload_file

logger = logging.getLogger(__name__)

router = APIRouter()

#in order to recieve file asynchronously, client will split up file into chnks and each chunk: 1MB, 
# then client will send chunk one at a time and fastAPI has asynchronous functionality to recieve a chunk (UploadFile import from fastAPI) and while processing that chunk, it can deal with diff request, 
#and when processing ends will wait for client to send next chunk, while waiting will deal with diff reqs
#when client will send last chunk, fastAPI will finish putting all chunks together into tempfile

CHUNK_SIZE = 1024 * 1024  # 1MB

@router.post("/upload", status_code=201)
async def upload_file(file: UploadFile):
#as long as chunk is still uploading from client, data still reaching server, this read method doesnt do anything
    file.read(CHUNK_SIZE) # asynchronous methof of UploadFile class, it reads the chunk that has alr been uploaded if a chunk has finished uploading
    try:
        with tempfile.NamedTemporaryFile() as temp_file:
            filename = temp_file.name
            logger.info(f"Saving uploaded file temporarily to {filename}")
            async with aiofiles.open(filename, 'wb') as f:
                while chunk := await file.read(CHUNK_SIZE): #while there is still data being uploaded from client i.e chunk not none
                    await f.write(chunk)
                    
            file_url = b2_upload_file(file_path=filename, file_name=file.filename) #file.filename: original filename uploaded by user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "There was an error uploading the file"
        )
    return {"detail": f"File successfully uploaded {file.filename}", "file_url": file_url}
                    

