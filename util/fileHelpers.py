import os

from datetime import datetime, timedelta
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


def getNewFileName(bank, firstTransaction, ext):
    try:
        date_obj = datetime.strptime(firstTransaction[0], '%d/%m/%Y')
    except:
        date_obj = datetime.strptime(firstTransaction[0], '%d/%m/%y')
    formatted_date = date_obj.strftime('%B%Y')
    return f"{bank}-{formatted_date}.{ext}"


def getDateForStatementCron():
    today = datetime.now()
    ten_days_ago = today - timedelta(days=10)
    today_str = today.strftime('%Y/%m/%d')
    ten_days_ago_str = ten_days_ago.strftime('%Y/%m/%d')
    return today_str, ten_days_ago_str


def format_date(input_date):
    # To have a common date format. Hopefully no statements with dates from 1900's or 2100's lol
    day, month, year = input_date.split('/')
    if len(year) == 2:
        year = '20' + year

    return f"{day}/{month}/{year}"

