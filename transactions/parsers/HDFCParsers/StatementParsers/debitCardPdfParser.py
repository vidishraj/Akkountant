import math
import re

import pandas
import tabula

from util.dbConnector import Config
from util.fileHelpers import getNewFileName
from util.logger import logging
import PyPDF2
from transactions.DBHandlers.HDFCTransactionHandler import HDFCTransactionHandler


class DebitCardPDFStatementParser:
    __endFlag: bool = False
    __TransactionList: list = []
    pagesInPDF: int
    password: str

    def __init__(self, transactionHandler: HDFCTransactionHandler):
        self.transactionHandler = transactionHandler
        self.password = Config['HDFC_Debit_Statement_Password']

    def countPages(self, filePath):
        file = open(filePath, 'rb')
        try:
            pdfReader = PyPDF2.PdfFileReader(file, password=self.password)
        except:
            pdfReader = PyPDF2.PdfFileReader(file)
        self.pagesInPDF = pdfReader.numPages

    def startParser(self, filePath: str, DriveID: str):
        self.__TransactionList = []
        self.countPages(filePath)
        self.readPages(filePath)
        newFileName = getNewFileName("HDFC_Debit", self.__TransactionList[0], filePath.split(".")[-1])
        for index, row in enumerate(self.__TransactionList):
            rowList = list(row)
            rowList.append(DriveID)
            self.__TransactionList[index] = tuple(rowList)
        insertedRows = self.transactionHandler.insertDebitCardStatementTransactions(self.__TransactionList)
        return insertedRows, newFileName

    def readPages(self, filePath):
        # (top,left,bottom,right)
        extraction_area = [266, 8, 800, 765]
        # columns = [6, 70, 288, 407, 503, 592]
        try:
            tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
                filePath, area=extraction_area, guess=False,
                pages="all",
                lattice=True, silent=True,
                password=self.password, pandas_options={'header': None})
            self.readTableFrame(tables)
        except:
            logging.error("Error finding tables in statement HDFC. Trying alternative config.")
            extraction_area = [228, 27, 800, 700]
            columns = [67, 272, 357, 397, 475, 551, 700]
            tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
                filePath, area=extraction_area, guess=False,
                pages="all",
                stream=True, silent=True,
                pandas_options={'header': None}, columns=columns)
            self.readTableFramesV2(tables)

    def readTableFramesV2(self, tables: [pandas.core.frame.DataFrame]):
        dateRegex: str = r'\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{2}\b'
        try:
            # pandas.set_option('display.max_columns', 7)   #For debugging only.
            for index, table in enumerate(tables):
                for innerIndex, row in table.iterrows():
                    try:
                        date = row[0]
                        if re.match(dateRegex, str(date)):
                            desc = row[1]
                            reference = row[2]
                            amount = None
                            if type(row[4]) != str and math.isnan(row[4]):
                                amount = float(str(row[5]).replace(",", ''))
                            if type(row[5]) != str and math.isnan(row[5]):
                                amount = -1 * float(str(row[4]).replace(",", ''))
                            closingBalance = float(str(row[6]).replace(",", ''))
                            self.__TransactionList.append((date, desc, amount, closingBalance, '',
                                                           reference))
                        elif type(row[0]) != str and type(row[2]) != str and math.isnan(row[0]) and type(
                                row[1]) == str and math.isnan(row[2]) and len(self.__TransactionList) > 0:
                            lastTuple = self.__TransactionList[-1]
                            lastList = list(lastTuple)
                            lastList[1] += row[1]
                            self.__TransactionList[-1] = tuple(lastList)
                    except Exception as ex:
                        logging.error(f"Error {ex}")
                        continue

                logging.info(f"Finished table {index + 1}. Transactions analysed: {len(self.__TransactionList)}")
            logging.info(f"Total transactions {len(self.__TransactionList)}")
        except Exception as ex:
            logging.error(f"Error reading tables in v2 as well. {ex}")

    def readTableFrame(self, tables: [pandas.core.frame.DataFrame]):
        dateRegex: str = "^(0[1-9]|1\\d|2\\d|3[01])\\/(0[1-9]|1[0-2])\\/(19|20)\\d{2}$"

        try:
            for index, table in enumerate(tables):
                for innerIndex, row in table.iterrows():
                    date = row[0]
                    if re.match(dateRegex, str(date)):
                        desc = row[1]
                        reference = row[2]
                        amount = row[4]
                        amount = amount.replace(",", "")
                        closingAmount = row[6]
                        if float(amount) == 0:
                            cleanVal = str(row[5]).replace(',', '')
                            creditVal = float(cleanVal)
                            amount = -1 * creditVal
                        self.__TransactionList.append(
                            (date, desc, amount, float(str(closingAmount).replace(',', '')), '',
                             reference))
        except Exception as ex:
            logging.error(f"Error occurred while inserting statement to HDFC.{ex}")
            return
