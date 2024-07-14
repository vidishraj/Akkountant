import re

import pandas
import tabula

from util.dbConnector import Config
from util.logger import logging
import PyPDF2
from transactions.DBHandlers.HDFCTransactionHandler import HDFCTransactionHandler


class CreditCardStatementParser:
    __endFlag: bool = False
    __TransactionList: list = []
    pagesInPDF: int
    password: str

    def __init__(self, transactionHandler: HDFCTransactionHandler):
        self.transactionHandler = transactionHandler
        self.password = Config['HDFC_Credit_Statement_Password']

    def countPages(self, filePath):
        file = open(filePath, 'rb')
        try:
            pdfReader = PyPDF2.PdfFileReader(file, password=self.password)
        except:
            pdfReader = PyPDF2.PdfFileReader(file)
        self.pagesInPDF = pdfReader.numPages

    def startParser(self, filePath, DriveID):
        self.__TransactionList = []
        self.countPages(filePath)
        self.readFirstPage(filePath)
        self.readSecondPage(filePath)
        for index, row in enumerate(self.__TransactionList):
            rowList = list(row)
            rowList.append(DriveID)
            self.__TransactionList[index] = tuple(rowList)
        insertedRows = self.transactionHandler.insertCreditCardStatementTransactions(self.__TransactionList)
        return insertedRows

    def readFirstPage(self, filePath):
        extraction_area = [429, 23, 677, 588]
        columns = [104, 476, 677]
        try:

            tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
                filePath,
                pages='1', area=extraction_area, guess=False,
                stream=True, silent=True,
                columns=columns, password=self.password)
        except:
            tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
                filePath,
                pages='1', area=extraction_area, guess=False,
                stream=True, silent=True,
                columns=columns)
        self.readTableFrame(tables)

    def readSecondPage(self, filePath):
        extraction_area = [64, 23, 709, 588]
        columns = [104, 476, 677]
        for i in range(2, self.pagesInPDF):
            try:
                tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
                    filePath,
                    pages=i, area=extraction_area, guess=False,
                    stream=True, silent=True,
                    columns=columns, password=self.password)
            except:
                tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
                    filePath,
                    pages=i, area=extraction_area, guess=False,
                    stream=True, silent=True,
                    columns=columns)
            self.readTableFrame(tables)

    def readTableFrame(self, tables):
        dateRegex: str = "^(0[1-9]|1\\d|2\\d|3[01])\\/(0[1-9]|1[0-2])\\/(19|20)\\d{2}$"
        try:
            for index, table in enumerate(tables):
                for innerIndex, rowDate in enumerate(table['Date']):
                    if re.match(dateRegex, str(rowDate)):
                        amountConverted = str(table['Amount (in Rs.)'][innerIndex]).replace(",", "")
                        if "Cr" in amountConverted:
                            amountConverted = amountConverted.replace("Cr", "")
                            amountConverted = -1 * float(amountConverted)
                        else:
                            amountConverted = float(amountConverted)
                        self.__TransactionList.append(
                            (table['Date'][innerIndex], table['Transaction Description'][innerIndex],
                             amountConverted))
        except Exception as ex:
            logging.error(f"Error occurred while inserting statement to HDFC.{ex}")
            return
