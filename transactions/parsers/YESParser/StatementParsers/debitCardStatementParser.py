import math
import re

import pandas
import tabula

from transactions.DBHandlers.YESTransactionHandler import YESTransactionHandler
from util.dbConnector import Config
from util.fileHelpers import getNewFileName
from util.logger import logging


class YESBankDebitParser:
    __endFlag: bool = False
    __TransactionList: list = []
    pagesInPDF: int
    password: str

    def __init__(self, transactionHandler: YESTransactionHandler):
        self.transactionHandler = transactionHandler
        self.password = Config['YES_Debit_Statement_Password']

    def startParser(self, filePath, DriveID):
        self.__TransactionList = []
        self.readPages(filePath)
        newFileName = getNewFileName("YES_Debit", self.__TransactionList[0], filePath.split(".")[-1])
        for index, row in enumerate(self.__TransactionList):
            rowList = list(row)
            rowList.append(DriveID)
            self.__TransactionList[index] = tuple(rowList)
        insertedRows = self.transactionHandler.insertDebitCardStatementTransactions(self.__TransactionList)
        return insertedRows, newFileName

    def readPages(self, filePath):
        # (top,left,bottom,right)
        columns = [92, 144, 282, 354, 420, 482, 700]
        extraction_area = [250, 44, 800, 700]
        try:
            tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
                filePath, guess=True,
                area=extraction_area, stream=True,
                pages="all", silent=True,
                password=self.password, pandas_options={'header': None}, columns=columns, multiple_tables=True)
            self.readTableFrame(tables)
        except:
            logging.error("Error finding tables in statement Yes Bank Debit.")

    def readTableFrame(self, tables: [pandas.core.frame.DataFrame]):
        dateRegex: str = r'\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}\b'
        try:
            # pandas.set_option('display.max_columns', 7)   #For debugging only.
            firstColP1 = False
            firstColP2 = False
            for index, table in enumerate(tables):
                for innerIndex, row in table.iterrows():
                    try:
                        if str(row[0]).strip() == "Transaction":
                            firstColP1 = True
                        elif firstColP1 and str(row[0]).strip() == "Date":
                            firstColP2 = True
                        if str(row[0]).strip() == "Opening Ba":
                            return
                        date = row[0]
                        if firstColP1 and firstColP2 and re.match(dateRegex, str(date).strip()):
                            desc = row[2]
                            amount = 0.0
                            if type(row[4]) == str and type(row[5]) == str:
                                crAmount = float(str(row[5]).replace(",", ''))
                                dbAmount = float(str(row[4]).replace(",", ''))
                                if dbAmount == 0:
                                    amount = crAmount
                                else:
                                    amount = dbAmount
                            closingBalance = float(str(row[6]).replace(",", ''))
                            if type(desc) != str and math.isnan(desc):
                                if innerIndex - 1 > 0 and type(table.iloc[innerIndex - 1][2]) == str:
                                    desc = table.iloc[innerIndex - 1][2]
                                if innerIndex + 1 < len(table) and type(table.iloc[innerIndex + 1][2]) == str:
                                    desc += table.iloc[innerIndex + 1][2]
                            self.__TransactionList.append((date, desc, amount, closingBalance, ''))
                    except Exception as ex:
                        logging.error(f"Error {ex}")
                        continue
                logging.info(f"Finished table {index + 1}. Transactions analysed: {len(self.__TransactionList)}")
            logging.info(f"Total transactions {len(self.__TransactionList)}")
        except Exception as ex:
            logging.error(f"Error reading tables in Yes Bank Debit. {ex}")
