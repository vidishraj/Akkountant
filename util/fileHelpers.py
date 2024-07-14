import os
from util.logger import logging

TempFolderPath = "/tmp"


def getFileContentLength(filePath):
    return os.path.getsize(os.path.join(TempFolderPath, filePath))


def deleteFileFromTemp(fileName):
    try:
        os.remove(os.path.join(TempFolderPath, fileName))

        logging.info(f"File '{fileName}' deleted successfully.")
        return True
    except FileNotFoundError:
        logging.error(f"File '{fileName}' not found.")
        return False
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return False


def checkIfFileInTemp(fileName):
    return os.path.exists(os.path.join(TempFolderPath, fileName))
