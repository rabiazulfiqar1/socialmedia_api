from logging.config import dictConfig
import logging
from socialmediaapi.config import config, DevConfig

#note: not including email in formatter bcz some log records may have that extra data and some not

def obfuscated(email: str, obfuscated_length: int = 2) -> str:
    #jose.salvatierra@examplenet jo**************@example.net
    characters = email[:obfuscated_length]
    first, last = email.split("@")  # jose.salvatierra, examplenet
    return characters + ("*" * (len(first) - obfuscated_length)) + "@" + last

#you may accidentally log personal info like email addresses, so we can make a custom filter to obfuscate (hide) email addresses in logs
#we aren't going to scan entire log message, we will obfuscate email addresses that are included as an extra argument in the log record
class EmailObfuscationFilter(logging.Filter):
    def __init__(self, name: str = "", obfuscated_length: int = 2) -> None:
        super().__init__(name) #here super class is logging.Filter, name is filter name when we configure it
        self.obfuscated_length = obfuscated_length
    
    def filter(self, record: logging.LogRecord) -> bool:
        if "email" in record.__dict__:
            record.email = obfuscated(record.email, self.obfuscated_length)  # function call which will return few chars of email and rest hidden, how many chars to show: self.obfuscated_length
            

        return True
        
# filter = asgi_correlation_id.CorrelationIdFilter(uuid_length = 8, default_value="-"), this is how arguments are passed to the filter constructor
def configure_logging() -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "filters": {
                "correlation_id": {  # adds new value to formatter that can be displayed there, it is a generated string unique to each request
                    "()": "asgi_correlation_id.CorrelationIdFilter",  # () is a constructor, any config parameters that we put in this dict after this one will be passed as keyword arguments to the constructor
                    "uuid_length": 8
                    if isinstance(config, DevConfig)
                    else 32,  # uuid: universally unique identifier, 8 characters long in dev, 32 in prod, longer the uuid, more unique it is
                    "default_value": "-",  # if we are not in a request, no uuid generated, so use this default value
                },
                "email_obfuscation": {
                    "()": EmailObfuscationFilter,
                    #name will be passed automatically, so not sending
                    "obfuscated_length": 2 if isinstance(config, DevConfig) else 0, #in production, no email chars shown, in dev 2
                }
            },
            "formatters": {
                "console": {
                    "class": "logging.Formatter",
                    "datefmt": "%Y-%m-%dT%H:%M:%S",
                    "format": "(%(correlation_id)s) %(name)s:%(lineno)d - %(message)s",
                },
                "file": {
                    # "class": "logging.Formatter",
                    "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
                    "datefmt": "%Y-%m-%dT%H:%M:%S",
                    # "format": "%(asctime)s.%(msecs)03dZ |  %(levelname)-8s | [%(correlation_id)s] %(name)s:%(lineno)d - %(message)s", for json you only need to tell which vars to use, it will format itself in json format
                    "format": "%(asctime)s.%(msecs)03d %(levelname)-8s %(correlation_id)s %(name)s %(lineno)d %(message)s",
                    # 03d means 3 digit milliseconds, Z is ISO format standard for UTC time,
                    # -8s will pad levelname string  with spaces to make it 8 characters long
                },
            },
            "handlers": {
                "default": {
                    # "class": "logging.StreamHandler",
                    "class": "rich.logging.RichHandler",
                    "level": "DEBUG",
                    "formatter": "console",
                    "filters": ["correlation_id", "email_obfuscation"],
                },
                "rotating_file": {  # it's just a log file but when log file becomes full (reaches a certain size), new log file vcreated and old one remains as long as you tells it to
                    "class": "logging.handlers.RotatingFileHandler",
                    "level": "DEBUG",  # we dont want handler to limit any logs, let logger do that
                    "formatter": "file",
                    "filename": "socialmediaapi.log",
                    "maxBytes": 1024 * 1024,  # 1 MB
                    "backupCount": 5,  # keep last 5 log files, will store 5MB of logs, make sure you have that much disk space
                    "encoding": "utf8",  # if logging in english, utf8 is good
                    "filters": ["correlation_id"],
                },
            },
            "loggers": {  # root.socialmediaapi.*
                "uvicorn": {"handlers": ["default", "rotating_file"], "level": "INFO"},
                "socialmediaapi": {  # name of logger
                    "handlers": ["default", "rotating_file"],
                    "level": "DEBUG"
                    if isinstance(config, DevConfig)
                    else "INFO",  # if config obj is DevConfig type, set level to DEBUG else INFO
                    "propagate": False,  # prevents log messages from being propagated to the root logger
                },
                "databases": {"handlers": ["default"], "level": "WARNING"},
                "aiosqlite": {"handlers": ["default"], "level": "WARNING"},
            },
        }
    )
    
#we can also configure multiple loggers in logging module, 1st one is "socialmediaapi" our main folder name (logger) defined, all folders and files logs will inherit from this,
#some libraries which we are using also use loggers as unicorn, databases and aiosqlite, we can configure them too for consistent logging behavior across the app

#without filters, if multiple logs from different requests are interleaved in the log file, it would be hard to tell which log belongs to which request
#for this, we use filters, they add correlation_id to each log record, so we can see which log belongs to which request, in case of multiple users making requests at the same time, we can differentiate between same logs from different requests

#its better to store log info in filers in JSON format, as most of the time we will be giving logs to 3rd party log services and then reading from there

#Logging filter is a class that has a function, which takes a log record as input and adds new value to it (correlation_id here), you can make custom filters too 