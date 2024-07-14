from datetime import datetime
from investments.mutualFunds.mfHandler import MutualFundsHandler
from mftool import Mftool



def getMutualFundDetails(schemeCode):
    mf = Mftool()
    schemeQuote = mf.get_scheme_quote(schemeCode)
    schemeDetails = mf.get_scheme_details(schemeCode)
    response = {
        "schemeCode": schemeCode,
        "fundHouse": schemeDetails["fund_house"],
        "schemeName": schemeDetails["scheme_name"],
        "schemeType": schemeDetails["scheme_type"],
        "schemeStartDate": schemeDetails["scheme_start_date"]['date'],
        "schemeStartNav": schemeDetails["scheme_start_date"]['nav'],
        "latestNav": schemeQuote["nav"],
        "lastUpdated": schemeQuote["last_updated"],
    }
    return response

class MutualFundService:
    Handler: MutualFundsHandler

    def __init__(self, mutualFundsHandler: MutualFundsHandler):
        self.Handler = mutualFundsHandler

    def fetchAllMutualFunds(self):
        return self.Handler.fetchAllMutualFunds()

    def fetchMutualFundsTransactions(self):
        return self.Handler.fetchMfTransactions()

    def insertMutualFund(self, schemeCode, schemeName, investmentNAV, investmentQuant, purchaseDate):
        if investmentNAV < 0 or investmentQuant < 0:
            return False
        if purchaseDate == "":
            purchaseDate = datetime.now().strftime("%d/%m/%Y")
        return self.Handler.insertMutualFund(tuple([schemeCode, schemeName, investmentNAV, investmentQuant,
                                                    investmentQuant * investmentNAV]), purchaseDate)

    def sellMutualFunds(self, soldQuant, schemeName, soldNav, schemeCode, boughtNav, boughtQuant, sellDate):
        if sellDate == "":
            sellDate = datetime.now().strftime("%d/%m/%Y")
        return self.Handler.sellMutualFund(soldQuant, schemeName, soldNav, schemeCode, boughtNav, boughtQuant, sellDate)

    def addMutualFunds(self, addNav, addQuant, schemeCode, oldQuant, oldNav, schemeName, buyDate):
        if buyDate == "":
            buyDate = datetime.now().strftime("%d/%m/%Y")
        return self.Handler.addMutualFund(addNav, addQuant, schemeCode, oldQuant, oldNav, schemeName, buyDate)

    def updateMutualFundsDetails(self):
        mutualFundTuples = self.Handler.fetchOnlyMfTable()
        schemeCodes = [stock[0] for stock in mutualFundTuples]
        globalStatus = False
        for schemeCode in schemeCodes:
            mfData = getMutualFundDetails(schemeCode)
            if len(mfData) > 0:
                status = self.Handler.insertMutualFundDetails(mfData)
                globalStatus = status
        return globalStatus
