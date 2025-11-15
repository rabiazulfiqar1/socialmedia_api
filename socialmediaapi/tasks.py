import logging
import httpx
from socialmediaapi.config import config
from json import JSONDecodeError
from databases import Database
from socialmediaapi.database import post_table

logger = logging.getLogger(__name__)

class APIResponseError(Exception):
    """Custom exception for API response errors."""
    pass

async def send_simple_email(to: str, subject: str, body: str):
    logger.info(f"Sending email to '{to[:3]}' with subject '{subject[:20]}'")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://api.mailgun.net/v3/{config.DEV_MAILGUN_DOMAIN}/messages",
                auth=("api", config.DEV_MAILGUN_API_KEY),
                data={
                    "from": f"Rabia Zulfiqar <mailgun@{config.DEV_MAILGUN_DOMAIN}>",
                    "to": [to], #list of email addresses to send to
                    "subject": subject,
                    "text": body,
                },
            )
            response.raise_for_status()  # Raise if HTTP status is 4xx/5xx as error codes, means HTTPS status doesnt start with 2 or 3: 2(success), 3(redirection)
            logger.debug(response.content)
            return response
        except httpx.HTTPStatusError as err:
            raise APIResponseError(
                f"API request failed with status code {err.response.status_code}"
            ) from err
    # url = "https://api.testmail.app/api/json/send"
    # payload = {
    #     "namespace": config.DEV_TESTMAIL_NAMESPACE,
    #     "to": to,
    #     "subject": subject,
    #     "text": body,
    # }
    # headers = {
    #     "Authorization": f"Bearer {config.DEV_TESTMAIL_API_KEY}",
    #     "Content-Type": "application/json",
    # }

    # async with httpx.AsyncClient() as client:
    #     try:
    #         response = await client.post(url, json=payload, headers=headers)
    #         response.raise_for_status()  # Raise if HTTP status is 4xx/5xx
    #         logger.info(f"Email sent successfully to {to}")
    #         return response.json()
    #     except httpx.HTTPStatusError as e:
    #         logger.error(f"Failed to send email: {e.response.text}")
    #         return {"error": e.response.text}
    #     except Exception as e:
    #         logger.error(f"Unexpected error while sending email: {e}")
    #         return {"error": str(e)}
    
async def send_user_registeration_email(email: str, confirmation_url: str):
    return await send_simple_email(
        email, #to
        "Successfully signed up", #subject
        #body
        (
            f"Hi {email}! You have successfully signed up to the Social Media API."
            " Please confirm your email by clicking on the"
            f" following link: {confirmation_url}"
        )
    )
 
# _ at start of func mean private func    
# we aren't going to call this ourselves , we want to write a func which will run as a background task
# and in background task we are going to write to our database (image url string)
async def _generate_cute_creature_api(prompt: str):
    logger.debug("Generating Cute Creature")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.deepai.org/api/cute-creature",
                data={"text": prompt},
                headers={"api-key": config.DEEPAI_API_KEY},
                timeout = 60,  #seconds
            )
            logger.debug(response)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as err:
            raise APIResponseError(
                f"API request failed with status code {err.response.status_code}"
            ) from err
        except (JSONDecodeError, TypeError) as err:
            raise APIResponseError("API response parsing failed") from err
        
#this is background task
async def generate_and_add_to_post(
    email: str, # when image generated, send email notification to user
    post_id: int, # add image to this post
    post_url: str,
    database: Database,
    prompt: str = "A cute panda"
):
    try:
        response = await _generate_cute_creature_api(prompt)
    except APIResponseError as err:
        # return await send_simple_email(
        #     email,
        #     "Error generating image",
        #     f"Hi {email}! Unfortuantely there was an error generating an image for your post."
        # )
        pass
        
    logger.debug("Conencting to database to update post")
    
    query = (
        post_table.update()
        .where(post_table.c.id == post_id)
        .values(image_url=response["output_url"])
    )
    
    logger.debug(query)
    
    await database.execute(query)
    
    logger.debug("Database conenction in background task closed")
    
    # await send_simple_email(
    #     email,
    #     "Image generation completed",
    #     (
    #         f"Hi {email}! The image for your post has been generated and added to your post."
    #         f" Please click on the following link to view it: {post_url}"
    #     ),
    # )