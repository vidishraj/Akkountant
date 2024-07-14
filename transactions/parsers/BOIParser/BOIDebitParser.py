import pandas
import tabula
from transactions.DBHandlers.BOITransactionHandler import BOITransactionHandler
from util.dbConnector import Config

class BOIDebitParser:
    __TransactionList = []
    month_mapping = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12"
    }
    pagesInPDF: int

    def __init__(self, transactionHandler: BOITransactionHandler):
        self.transactionHandler = transactionHandler

    def startParser(self, filePath, DriveID):
        self.__TransactionList = []
        self.countPages(filePath)
        self.readFirstPage(filePath)
        if self.pagesInPDF > 1:
            self.readSecondPageOnwards(filePath)
        for index, row in enumerate(self.__TransactionList):
            rowList = list(row)
            rowList.append(DriveID)
            self.__TransactionList[index] = rowList
        insertionCount = self.transactionHandler.insertDebitCardStatement(self.__TransactionList)
        return insertionCount

    def countPages(self, filePath):
        tables = tabula.read_pdf(filePath, pages='all', password=Config['BOI_Statement_Password'])
        self.pagesInPDF = len(tables) - 1

    def readTableFrame(self, tables):
        for index, item in enumerate(tables['Transaction']):
            if type(item) == str:
                itemList: list = item.split('-')
                if len(itemList) == 3:
                    itemList[1] = self.month_mapping[itemList[1]]
                    newDateFormat = "/".join(itemList)
                    if tables['Debit'][index] != "-":
                        amount = float(tables['Debit'][index])
                    else:
                        amount = -1 * float(tables['Credit'][index])
                    self.__TransactionList.append(
                        (newDateFormat, tables['Narration'][index], amount, tables['Balance'][index]))

    def readFirstPage(self, filePath):
        extraction_area = [244, 59, 796, 541]
        columns = [116, 188, 363, 413, 466, 537]
        tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
            filePath,
            pages='1', area=extraction_area, guess=False,
            stream=True, silent=True,
            columns=columns, password='96328501')
        self.readTableFrame(tables[0])

    def readSecondPageOnwards(self, filePath):
        extraction_area = [1, 59, 1000, 541]
        columns = [116, 188, 363, 413, 466, 537]
        tables: [pandas.core.frame.DataFrame] = tabula.read_pdf(
            filePath,
            pages=f'2-{self.pagesInPDF}', area=extraction_area, guess=True,
            stream=True, silent=True,
            columns=columns, password='96328501', pandas_options={'header': None})
        newColumns = ['Transaction', 'Instrument Id', 'Narration', 'Debit', 'Credit', 'Balance']
        for index, table in enumerate(tables):
            tables[index].columns = newColumns
            self.readTableFrame(tables[index])
        tables[0].columns = newColumns
