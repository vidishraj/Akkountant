from datetime import datetime, timedelta

from investments.ppf.ppfHandler import PPFHandler
from util.logger import logging


def convert_month_string_to_date(month_string):
    return datetime.strptime(month_string, '%b-%Y')


def convert_date_to_month_string(date):
    return date.strftime('%b-%Y')


def iterate_months(start_month, end_month):
    start_date = convert_month_string_to_date(start_month)
    end_date = convert_month_string_to_date(end_month)

    current_date = start_date
    while current_date <= end_date:
        yield convert_date_to_month_string(current_date)
        current_date += timedelta(days=31)


def convertDate(date_str):
    date_obj = datetime.strptime(date_str, '%d/%m/%Y')

    month = date_obj.strftime('%b')
    year = date_obj.strftime('%Y')

    if date_obj.day < 5:
        return f"{month}-{year}"
    else:
        next_month = (date_obj.month % 12) + 1
        next_year = date_obj.year + (date_obj.month + 1 > 12)
        next_month_name = datetime(year=next_year, month=next_month, day=1).strftime('%b')
        return f"{next_month_name}-{next_year}"


class PPFService:
    Handler: PPFHandler

    def __init__(self, ppfHandler: PPFHandler):
        self.Handler = ppfHandler

    def recalculatePPFValues(self):
        try:
            deposits = self.Handler.fetchOnlyPPFDeposit()
            interestRates = self.Handler.fetchOnlyInterest()

            if deposits is False or interestRates is False or len(deposits) == 0:
                logging.info("Error while fetching deposits, interest rates or no deposits.")
                return

            depositDict = {}
            ppfTableRows = []

            def get_date_from_tuple(t):
                return datetime.strptime(t[1], '%d/%m/%Y')
            sorted_lst = sorted(deposits, key=get_date_from_tuple)
            startMonth = convertDate(sorted_lst[0][1])
            current_date = datetime.now()
            # current_date = current_date.replace(month=current_date.month+1)
            endMonth = f"{current_date.strftime('%b')}-{current_date.strftime('%Y')}"
            interestDict = {}
            for interestTuple in interestRates:
                interestDict[interestTuple[0]] = interestTuple[1]
            for deposit in deposits:
                currentDepositKey = convertDate(deposit[1])
                if depositDict.get(currentDepositKey) is None:
                    depositDict[currentDepositKey] = float(deposit[2])
                else:
                    depositDict[currentDepositKey] += float(deposit[2])
            closingBalance = 0
            for month in iterate_months(startMonth, endMonth):
                openingBalance = closingBalance
                if depositDict.get(month) is not None:
                    openingBalance += depositDict[month]
                closingBalance = openingBalance
                interest = round(float(openingBalance * (float(interestDict[month]) / 1200)), 2)
                closingBalance = round(closingBalance + interest, 2)
                ppfTableRows.append((month, openingBalance, interest, closingBalance))
            return self.Handler.insertIntoPPFTable(ppfTableRows)
        except Exception as ex:
            logging.error(f"Error while inserting rows in to ppf table. {ex}")
            return False

    def fetchAllDeposits(self):
        return self.Handler.fetchAllDeposits()

    def fetchAllPPF(self):
        return self.Handler.fetchAllFromPPFTable()

    def fetchAllPPFInterest(self):
        return self.Handler.fetchAllInterests()

    def insertDeposit(self, depositDate, depositAmount):
        if depositAmount < 0:
            return False
        try:
            datetime.strptime(depositDate, '%d/%m/%Y')
        except ValueError:
            return False
        return self.Handler.insertIntoPPFDeposit(tuple([depositDate, depositAmount]))

    def insertInterest(self, month, interestRate):
        if interestRate < 0:
            return False
        try:
            datetime.strptime(month, '%b-%Y')
        except ValueError:
            return False

        return self.Handler.addToInterestTable(month, interestRate)

    def deletePPFDeposit(self, depositID):
        return self.Handler.deleteDeposits(depositID)
