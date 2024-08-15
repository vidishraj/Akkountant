import pandas
import tabula
import re
from transactions.DBHandlers.ICICITransactionHandler import ICICITransactionHandler
from util.dbConnector import Config
from util.fileHelpers import getNewFileName


class ICICICreditCardStatementParser:
    __TransactionList = []
    preDefinedColumns = ['Date', 'SerNo.', 'Transaction Details', 'Reward', 'Intl.#',
                         'Amount (in`)']
    password: str

    def __init__(self, transactionHandler: ICICITransactionHandler):
        self.transactionHandler = transactionHandler
        self.password = Config['ICICI_Statement_Password']

    def startParser(self, filePath, DriveID):
        self.__TransactionList = []
        self.readFirstPage(filePath)
        self.readSecondPage(filePath)
        newFileName = getNewFileName("ICICI_Credit", self.__TransactionList[0], filePath.split(".")[-1])
        for index, row in enumerate(self.__TransactionList):
            rowList = list(row)
            rowList.append(DriveID)
            self.__TransactionList[index] = rowList
        insertionCount = self.transactionHandler.insertCreditCardStatement(self.__TransactionList)
        return insertionCount, newFileName

    def readFirstPage(self, filePath):
        extraction_area = [365, 199, 623, 568]
        columns = [243, 299, 435, 473, 515, 568]
        tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
            filePath,
            pages='1', area=extraction_area, guess=False,
            stream=True, silent=True,
            columns=columns, password=self.password)
        self.readTableFrame(tables)

    def readSecondPage(self, filePath):
        extraction_area = [58, 30, 834, 589]
        columns = [86, 169, 366, 437, 507, 562]
        tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
            filePath,
            pages=f'2', area=extraction_area, guess=False,
            stream=True, silent=True,
            columns=columns, password='vidi1105')
        if tables[0].columns[0] == "Date":
            tables[0].columns = self.preDefinedColumns
            self.readTableFrame(tables)

    def readTableFrame(self, tables):
        dateRegex: str = "^(0[1-9]|1\\d|2\\d|3[01])\\/(0[1-9]|1[0-2])\\/(19|20)\\d{2}$"
        for index, table in enumerate(tables):
            for innerIndex, rowDate in enumerate(table['Date']):
                if re.match(dateRegex, str(rowDate)):
                    amountConverted = str(table['Amount (in`)'][innerIndex]).replace(",", "")
                    if "CR" in amountConverted:
                        amountConverted = amountConverted.replace("CR", "")
                        amountConverted = -1 * float(amountConverted)
                    else:
                        amountConverted = float(amountConverted)
                    self.__TransactionList.append(
                        (table['Date'][innerIndex], table['SerNo.'][innerIndex],
                         table['Transaction Details'][innerIndex],
                         table['Reward'][innerIndex],
                         amountConverted))
