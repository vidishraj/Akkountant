from datetime import datetime

from investments.fd.fdHandler import FDHandler


class FDService:
    Handler: FDHandler

    def __init__(self, fdHandler: FDHandler):
        self.Handler = fdHandler

    def fetchAllFD(self):
        return self.Handler.fetchAllFDDeposits()

    def insertFDDeposit(self, investmentAmount, interestRate, duration, tenure, bank, depositDate, maturityAmount):
        if investmentAmount < 0 or interestRate < 0 or duration < 0 or tenure < 0:
            return False
        try:
            datetime.strptime(depositDate, '%d/%m/%Y')
        except ValueError:
            return False
        return self.Handler.insertIntoFDDeposit(tuple([depositDate, investmentAmount, interestRate, tenure, duration,
                                                       bank, maturityAmount]))

    def deleteFDDeposit(self, depositID):
        return self.Handler.deleteDeposits(depositID)
