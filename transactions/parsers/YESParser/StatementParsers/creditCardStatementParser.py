import re

import pandas
import tabula

from transactions.DBHandlers.YESTransactionHandler import YESTransactionHandler
from util.dbConnector import Config
from util.fileHelpers import getNewFileName
from util.logger import logging


class YESBankCreditParser:
    __endFlag: bool = False
    __TransactionList: list = []
    pagesInPDF: int
    password: str

    def __init__(self, transactionHandler: YESTransactionHandler):
        self.transactionHandler = transactionHandler
        self.password = Config['YES_Credit_Statement_Password']

    def startParser(self, filePath, DriveID):
        self.__TransactionList = []
        self.readPages(filePath)
        newFileName = getNewFileName("YES_Credit", self.__TransactionList[0], filePath.split(".")[-1])
        for index, row in enumerate(self.__TransactionList):
            rowList = list(row)
            rowList.append(DriveID)
            self.__TransactionList[index] = tuple(rowList)
        insertedRows = self.transactionHandler.insertCreditCardStatementTransactions(self.__TransactionList)
        return insertedRows, newFileName

    def readPages(self, filePath):
        tables = []
        extraction_area = [10, 20, 800, 650]
        columns = [96, 485, 650]
        for i in range(1, 1000):
            try:
                tables += tabula.read_pdf(
                    filePath, guess=True, silent=True,
                    area=extraction_area, stream=True,
                    pages=f'{i}',
                    password=self.password, pandas_options={'header': None}, columns=columns, multiple_tables=True)
            except:
                break
        self.readTableFrame(tables)

    def readTableFrame(self, tables: [pandas.core.frame.DataFrame]):
        dateRegex: str = r'\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}\b'
        try:
            # pandas.set_option('display.max_columns', 7)   #For debugging only.
            tableStart = False
            for index, table in enumerate(tables):
                for innerIndex, row in table.iterrows():
                    try:
                        if str(row[0]).strip() == "Date" and str(row[1]).strip() == "Transaction Details" and str(
                                row[2]).strip() == "Amount (Rs.)":
                            tableStart = True

                        date = row[0]
                        if tableStart and "End of the statement" in row[1]:
                            return
                        if tableStart and re.match(dateRegex, date):
                            desc = str(row[1])
                            amount = row[2]
                            reference = ""
                            descSplit = desc.split("Ref No:")
                            if len(descSplit) > 1:
                                reference = descSplit[1]
                                desc = descSplit[0][0:-2]
                            cleanedAmount = float(str(amount[0:-3]).replace(",", ''))
                            amountType = amount[len(amount) - 2: len(amount)]
                            if amountType == "Cr":
                                cleanedAmount = -1 * cleanedAmount
                            self.__TransactionList.append((date, desc, cleanedAmount, '', reference))
                    except Exception as ex:
                        logging.error(f"Error {ex}")
                        continue
                logging.info(f"Finished table {index + 1}. Transactions analysed: {len(self.__TransactionList)}")
            logging.info(f"Total transactions {len(self.__TransactionList)}")
        except Exception as ex:
            logging.error(f"Error reading tables in YES bank Credit {ex}")
