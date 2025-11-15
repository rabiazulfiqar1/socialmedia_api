import logging
#lru_cache is used to store result of funcs as cache so that when func is called again with same parameters, it can return cached result instead of recomputing it
from functools import lru_cache

import b2sdk.v2 as b2
from socialmediaapi.config import config

logger = logging.getLogger(__name__)

@lru_cache() #since authentication details aren't gonna change, so compute func only once
def b2_api():
    # in the InMemoryAccountInfo, authenticated info (.B2_KEY_ID,config.B2_APPLICATION_KEY,) will be stored
    logger.debug("Creating and authorizing B2 API")
    info = b2.InMemoryAccountInfo()
    b2_api = b2.B2Api(info)
    b2_api.authorize_account(
        "production",
        config.B2_KEY_ID,
        config.B2_APPLICATION_KEY,
    )
    return b2_api

#get bucket in which files will be stored
@lru_cache()
def b2_get_bucket(api: b2.B2Api):
    return api.get_bucket_by_name(config.B2_BUCKET_NAME)

def b2_upload_file(file_path: str, file_name: str) -> str:
    api = b2_api() 
    logger.debug(f"Uploading {file_path} to B2 as {file_name}")
#uploaded_file is an object
    uploaded_file = b2_get_bucket(api).upload_local_file(
        local_file=file_path,
        file_name=file_name,
    )
#just putting this download_url in browser will let you download or see the file
    download_url = api.get_download_url_for_fileid(uploaded_file.id_)
    logger.debug(f"Uploaded {file_path} to B2 successfully and got download URL: {download_url}")
    return download_url