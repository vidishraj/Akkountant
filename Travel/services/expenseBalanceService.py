from Travel.dbHandlers.expenseBalanceHandler import ExpenseBalanceHandler


class ExpenseBalanceService:
    Handler: ExpenseBalanceHandler

    def __init__(self, exBlHandler: ExpenseBalanceHandler):
        self.Handler = exBlHandler
