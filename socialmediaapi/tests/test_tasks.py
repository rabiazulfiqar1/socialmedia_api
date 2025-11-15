import httpx
import pytest

from socialmediaapi.tasks import APIResponseError, send_simple_email, generate_and_add_to_post, _generate_cute_creature_api
from socialmediaapi.database import database, post_table
from databases import Database  

@pytest.mark.anyio
async def test_generate_cute_creature_api_success(mock_httpx_client):
    json_data = {"output_url": "https://example.com/image.jpg"}
    
    mock_httpx_client.post.return_value = httpx.Response(
        status_code=200, json=json_data, request=httpx.Request("POST", "//") #fake request
    )
    
    result = await _generate_cute_creature_api("A cute puppy")
    assert result == json_data
    
@pytest.mark.anyio
async def test_generate_cute_creature_api_error(mock_httpx_client):
    mock_httpx_client.post.return_value = httpx.Response(
        status_code=500, request=httpx.Request("POST", "//")
    )
    
    with pytest.raises(
        APIResponseError, match="API request failed with status code 500"
    ):
        await _generate_cute_creature_api("A cute puppy")
        
@pytest.mark.anyio
async def test_generate_cute_creature_api_json_error(
    mock_httpx_client,
):
    mock_httpx_client.post.return_value = httpx.Response(
        status_code=200, content="Not JSON", request=httpx.Request("POST", "//")
    )
    
    with pytest.raises(
        APIResponseError, match="API response parsing failed"
    ):
        await _generate_cute_creature_api("A cute puppy")

@pytest.mark.anyio
async def test_generate_and_add_to_post_success(
    mock_httpx_client,
    created_post: dict,
    confirmed_user: dict,
    db: Database,
):
    json_data = {"output_url": "https://example.com/image.jpg"}
    
    mock_httpx_client.post.return_value = httpx.Response(
        status_code=200, json=json_data, request=httpx.Request("POST", "//")
    )
    
    await generate_and_add_to_post(
        confirmed_user["email"],
        created_post["id"],
        "/post/1", #post url: when we write this code in router, post url generated dynamically so users can click on it so dont worry about "/post/1"
        db,
        "A cute puppy",
    )
    
    query = post_table.select().where(post_table.c.id == created_post["id"])
    updated_post = await db.fetch_one(query)
    assert updated_post["image_url"] == json_data["output_url"]