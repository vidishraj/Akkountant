import logging


def setup_logger(level=logging.DEBUG):
    try:
        logging.getLogger('googleapiclient.discovery').setLevel(logging.WARNING)
        logging.getLogger('urllib3.connectionpool').setLevel(logging.WARNING)
        logging.getLogger('google.auth.transport.requests').setLevel(logging.WARNING)
        logging.getLogger('googleapiclient.discovery_cache').setLevel(logging.WARNING)
        logging.getLogger('mysql.connector').setLevel(logging.ERROR)
        logging.getLogger('tzlocal').setLevel(logging.ERROR)
        logInst = logging.getLogger()
        formatter = logging.Formatter(
            '%(asctime)s %(levelname)s %(threadName)s-%(thread)d: %(message)s [in %(filename)s:%(lineno)d]')
        streamHandler = logging.StreamHandler()
        streamHandler.setFormatter(formatter)
        logInst.setLevel(level)
        logInst.addHandler(streamHandler)
    except Exception as ex:
        print(f"Error setting logger {ex}")
        quit(-2)


setup_logger()
logging = logging.getLogger('flaskLogger')
