import math
import uuid

from util.dbConnector import Config
from util.fileHelpers import getNewFileName, format_date
from util.logger import logging
import datetime
import pandas
from transactions.DBHandlers.HDFCTransactionHandler import HDFCTransactionHandler


def cleanRowData(row, driveID):
    try:
        date: datetime = datetime.datetime.strptime(str(row['Date'].strip()), '%d/%m/%y').date()
        date = format_date(date)
        tag = ""
        finalDescription: str = ""
        description = row['Narration']
        if "UPI" in description:
            description: str = row['Narration'].strip().split('-')
            if description[-1] != "UPI":
                tag = description[-1]
            if description[0] == "UPI":
                for i in range(1, len(description) - 1):
                    finalDescription += description[i]
            else:
                for i in range(0, len(description) - 1):
                    finalDescription += description[i]
        amount: float
        if row['Debit Amount'] > 0:
            amount = row['Debit Amount']
        else:
            amount = -1 * row['Credit Amount']
        referenceNumber = str(row['Chq/Ref Number']).strip()
        if referenceNumber == "":
            # Necessary primary key check.
            referenceNumber = str(uuid.uuid4())
        # Removing leading 0's for common format between statement types.
        referenceNumber = referenceNumber.lstrip('0')
        finalDescription = finalDescription.strip()
        if finalDescription == "":
            finalDescription = row['Narration']
        closingAmount = row['Closing Balance']
        return date, finalDescription, amount, closingAmount, tag, referenceNumber, driveID
    except Exception as ex:
        logging.error(f"Error while cleaning data of row {row} {ex}")


class DebitCardStatementParser:
    password: str

    def __init__(self, transactionHandler: HDFCTransactionHandler):
        self.transactionHandler = transactionHandler
        self.password = Config['HDFC_Debit_Statement_Password']

    def readCSVPages(self, filepath, driveID):
        try:
            logging.info("-----Starting CSV parsing-----")
            csvFile = pandas.read_csv(filepath)
            newColList = [col.strip() for col in csvFile.columns]
            csvFile.columns = newColList
            df = pandas.DataFrame(csvFile,
                                  columns=newColList)
            transactionList: list = []
            for index, row in df.iterrows():
                transactionList.append(cleanRowData(row, driveID))
            logging.info(f"Read csv file with {len(transactionList)} rows.")
            logging.info("-----Finished CSV parsing-----")

            newFileName = getNewFileName("HDFC_Debit", transactionList[0], filepath.split(".")[-1])
            insertionCount = self.transactionHandler.insertDebitCardStatementTransactions(transactionList)
            return insertionCount, newFileName
        except Exception as ex:
            logging.error(f"Error while reading csv file. {ex}")
