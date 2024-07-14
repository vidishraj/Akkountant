from investments.fd.fdHandler import FDHandler
from investments.fd.fdService import FDService
from investments.mutualFunds.mfHandler import MutualFundsHandler
from investments.mutualFunds.mfService import MutualFundService
from investments.nps.npsHandler import NPSHandler
from investments.nps.npsService import NPSService
from investments.pf.pfHandler import PFHandler
from investments.pf.pfService import PFService
from investments.stocks.stocksHandler import StocksHandler
from investments.stocks.stocksService import StockService
from investments.ppf.ppfHandler import PPFHandler
from investments.ppf.ppfService import PPFService
from util.dbConnector import getConnection, ConnectionPool
from investments.gold.goldHandler import GoldHandler
from investments.gold.goldService import GoldService
from util.dbConnector import InstanceList


class InvestmentInstances:
    if ConnectionPool is not None:
        investmentConnection = getConnection()
        investmentConnection2 = getConnection()
        investmentConnection3 = getConnection()
        investmentConnection4 = getConnection()
        investmentConnection5 = getConnection()
        investmentConnection6 = getConnection()
        investmentConnection7 = getConnection()

        stockHandlerInstance = StocksHandler(investmentConnection)
        mutualFundsHandler = MutualFundsHandler(investmentConnection2)
        ppfHandlerInstance = PPFHandler(investmentConnection3)
        goldHandlerInstance = GoldHandler(investmentConnection4)
        fdHandlerInstance = FDHandler(investmentConnection5)
        pfHandlerInstance = PFHandler(investmentConnection6)
        npsHandlerInstance = NPSHandler(investmentConnection7)

        InstanceList.append(stockHandlerInstance)
        InstanceList.append(mutualFundsHandler)
        InstanceList.append(ppfHandlerInstance)
        InstanceList.append(goldHandlerInstance)
        InstanceList.append(fdHandlerInstance)
        InstanceList.append(pfHandlerInstance)
        InstanceList.append(npsHandlerInstance)

        mutualFundsService = MutualFundService(mutualFundsHandler)
        ppfServiceInstance = PPFService(ppfHandlerInstance)
        goldServiceInstance = GoldService(goldHandlerInstance)
        stockServiceInstance = StockService(stockHandlerInstance)
        fdServiceInstance = FDService(fdHandlerInstance)
        pfServiceInstance = PFService(pfHandlerInstance)
        npsServiceInstance = NPSService(npsHandlerInstance)
    else:
        stockHandlerInstance = None
        mutualFundsHandler = None
        ppfHandlerInstance = None
        goldHandlerInstance = None
        fdHandlerInstance = None
        pfHandlerInstance = None
        npsHandlerInstance = None

        mutualFundsService = None
        ppfServiceInstance = None
        goldServiceInstance = None
        stockServiceInstance = None
        fdServiceInstance = None
        pfServiceInstance = None
        npsServiceInstance = None
