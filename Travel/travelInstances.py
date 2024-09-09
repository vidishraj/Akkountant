from Travel.services.expenseBalanceService import ExpenseBalanceService
from Travel.services.tripUserService import TripUserService
from util.dbConnector import getConnection, ConnectionPool
from util.dbConnector import InstanceList
from Travel.dbHandlers.tripUserHandler import TripUserHandler
from Travel.dbHandlers.expenseBalanceHandler import ExpenseBalanceHandler


class TravelInstance:
    if ConnectionPool is not None:

        transactionConnectionInstance = getConnection()
        transactionConnectionInstance2 = getConnection()

        tripHandler = TripUserHandler(transactionConnectionInstance)
        expenseHandler = ExpenseBalanceHandler(transactionConnectionInstance2)

        tripUserService = TripUserService(tripHandler)
        expenseBalanceService = ExpenseBalanceService(expenseHandler)

        InstanceList.append(TripUserHandler)
        InstanceList.append(ExpenseBalanceHandler)

    else:
        transactionConnectionInstance = None
        transactionConnectionInstance2 = None
        tripHandler = None
        expenseHandler = None
        tripUserService = None
        expenseBalanceService = None
