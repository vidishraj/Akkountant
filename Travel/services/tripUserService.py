from Travel.dbHandlers.tripUserHandler import TripUserHandler


class TripUserService:
    Handler: TripUserHandler

    def __init__(self, tripUserHandler: TripUserHandler):
        self.Handler = tripUserHandler

    def createTrip(self, tripData):
        return self.Handler.insertTrip(tripData)

    def fetchTrip(self):
        return self.Handler.fetchAllTrips()

    def fetchUserForTrip(self, tripId):
        return self.Handler.fetchUsersForTrip(tripId)

    def addUserToTrip(self, user):
        return self.Handler.addUserToTrip(user)

    def fetchExpensesForTrip(self, tripId):
        return self.Handler.fetchExpForTrip(tripId)

    def deleteExpenseFromTrip(self, expenseId):
        return self.Handler.deleteExpenseFromTrip(expenseId)

    def addExpenseForTrip(self, expense):
        """ First obj is to insert the expense, then individually call the balance table."""
        balanceObjs = []
        splitLst:list = expense['splitBetween'].split(',')
        paidByIdx = splitLst.index(expense['paidBy'])
        splitAmount:list= expense['splitRatio'].split(',')
        splitAmountForPayee = splitAmount[paidByIdx]


        userPaid =0
        return self.Handler.addExpenseForTrip(expense)
