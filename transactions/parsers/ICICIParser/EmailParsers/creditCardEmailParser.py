import re

from transactions.DBHandlers.ICICITransactionHandler import ICICITransactionHandler
from util.logger import logging
from googleapiclient.discovery import build
import datetime


def currentMonthsDate():
    current_date = datetime.date.today()
    first_day = current_date.replace(day=1)

    if current_date.month == 12:
        last_day = current_date.replace(year=current_date.year + 1, month=1, day=1) - datetime.timedelta(days=1)
    else:
        last_day = current_date.replace(month=current_date.month + 1, day=1) - datetime.timedelta(days=1)

    first_day_formatted = first_day.strftime("%Y/%m/%d")
    last_day_formatted = last_day.strftime("%Y/%m/%d")
    return first_day_formatted, last_day_formatted


class ICICICreditEmailParser:
    """
    The job of this class is to just parse the mail of the user and find all the mails related to
    the debit card usage.
    """

    __searchString: str = "from:(credit_cards@icicibank.com) Transaction alert for your ICICI Bank Credit Card"
    __userGmailAPI: build

    def __init__(self, gmailAPIInstance: build, transactionInstance: ICICITransactionHandler):
        self.__userGmailAPI = gmailAPIInstance
        self.transactionInstance = transactionInstance

    def creditCardEmailParser(self,dateFrom, dateTo):
        """
        This method will look for emails sent for debit card transactions, parse the information and then
        saves the information in the database.
        :return: null
        """
        logging.info("-----Starting the ICICI Credit Email Parsing-----")
        if dateFrom is None or dateTo is None:
            dateFrom, dateTo = self.currentMonthsDate()
        results = self.__userGmailAPI.users().messages().list(userId='me', q=self.__searchString
                                                                             + f" after:{dateFrom} before:{dateTo}").execute()
        emails = results.get('messages', [])
        creditTransactions = []
        if not emails:
            logging.info(f"No debit card transactions found for the range {dateFrom} to {dateTo} ")
            return {"Error": "No debit card transactions found."}
        for email in emails:
            pattern = r"Dear Customer, Your ICICI Bank Credit Card XX7001 has been used for a transaction of (.*?) on (.*?) at (.*?).Info: (.*?). The Available Credit Limit"

            emailText = self.__userGmailAPI.users().messages().get(userId="me", id=email['id']).execute()[
                'snippet']
            matches = re.findall(pattern, emailText)
            if matches:
                for match in matches:
                    amount, date, time, vendor = match
                    amount = float(amount.replace("INR ", ""))
                    parsed_date = datetime.datetime.strptime(date, "%b %d, %Y")
                    formatted_date = parsed_date.strftime("%d/%m/%Y")
                    creditTransactions.append((formatted_date, vendor, amount, " ", "ICICI"))
            else:
                continue

        logging.info(f"Debit Parser finished parsing email. {len(creditTransactions)} transactions read.")
        return self.transactionInstance.updateLiveTable(creditTransactions)
