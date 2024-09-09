import mysql.connector
from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging
from util.dbReset import DBReset


class TripUserHandler(DBReset):

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def insertTrip(self, tripData):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.createTripQuery, tuple([tripData]))
        self._dbConnection.commit()
        cursor.close()
        return True

    def fetchAllTrips(self):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchTripsQuery)
        trips = cursor.fetchall()
        result = []
        keys = ['tripId', 'tripTitle']
        for trip in trips:
            result.append({keys[i]: value for i, value in enumerate(trip)})
        cursor.close()
        return result

    def fetchUsersForTrip(self, tripId):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchUsersForSpecificTrip, tuple([tripId]))
        users = cursor.fetchall()
        print(users, tripId)
        result = []
        keys = ['userId', 'userName', 'tripId']
        for user in users:
            result.append({keys[i]: value for i, value in enumerate(user)})
        cursor.close()
        return result

    def addUserToTrip(self, user):
        self._dbConnection.commit()
        print(user)
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.createUser, tuple(user))
        self._dbConnection.commit()
        cursor.close()
        return True

    def fetchExpForTrip(self, tripId):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchExpensesFromTrip, tuple([tripId]))
        expenses = cursor.fetchall()
        result = []
        keys = ['expenseId', 'expenseDate', 'expenseDesc', 'expenseAmount', 'expensePaidBy', 'expenseSplitBw', 'tripId']
        for expense in expenses:
            result.append({keys[i]: value for i, value in enumerate(expense)})
        cursor.close()
        return result

    def deleteExpenseFromTrip(self, expenseId):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteExpense, tuple([expenseId]))
        self._dbConnection.commit()
        cursor.close()
        return True

    def addExpenseForTrip(self, expenseId):
        # Add expense to expense table and update balance table as well
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.insertExpense, tuple([expenseId]))
        self._dbConnection.commit()
        cursor.close()
        return True
