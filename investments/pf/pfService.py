from investments.pf.pfHandler import PFHandler


class PFService:
    Handler: PFHandler

    def __init__(self, pfHandler: PFHandler):
        self.Handler = pfHandler

    def fetchAllPf(self):
        return self.Handler.fetchAllPf()

    def fetchPfInterestRates(self):
        return self.Handler.fetchAllPfInterestRates()

    def fetchPfInterest(self):
        return self.Handler.fetchAllPfInterest()

    def insertPf(self, rowList):
        return self.Handler.recalculatePF(rowList)

    def editPF(self, rowList):
        return self.Handler.editPF(rowList)

    def recalculateInterest(self):
        return self.Handler.recalculatePF([])
