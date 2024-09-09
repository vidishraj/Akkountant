
import mysql.connector
from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging
from util.dbReset import DBReset


class ExpenseBalanceHandler(DBReset):

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

