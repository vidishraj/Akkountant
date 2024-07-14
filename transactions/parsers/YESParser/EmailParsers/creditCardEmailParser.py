import re

from transactions.DBHandlers import YESTransactionHandler
from transactions.DBHandlers.HDFCTransactionHandler import HDFCTransactionHandler
from util.logger import logging
from googleapiclient.discovery import build
import datetime


class YESCreditEmailParser:
    """
    The job of this class is to just parse the mail of the user and find all the mails related to
    the debit card usage.
    """

    __searchString: str = "Yes Bank - Transaction Alert"
    __userGmailAPI: build

    def __init__(self, gmailAPIInstance: build, transactionInstance: YESTransactionHandler):
        self.__userGmailAPI = gmailAPIInstance
        self.transactionInstance = transactionInstance

    def currentMonthsDate(self):
        current_date = datetime.date.today()
        first_day = current_date.replace(day=1)

        if current_date.month == 12:
            last_day = current_date.replace(year=current_date.year + 1, month=1, day=1) - datetime.timedelta(days=1)
        else:
            last_day = current_date.replace(month=current_date.month + 1, day=1) - datetime.timedelta(days=1)

        first_day_formatted = first_day.strftime("%Y/%m/%d")
        last_day_formatted = last_day.strftime("%Y/%m/%d")
        return first_day_formatted, last_day_formatted

    def debitCardMailParser(self, dateFrom, dateTo):
        """
        This method will look for emails sent for debit card transactions, parse the information and then
        saves the information in the database.
        :return: null
        """
        logging.info("-----Starting the Yes Bank Transaction Parsing-----")
        debitTransactions: list = []
        if dateFrom is None or dateTo is None:
            dateFrom, dateTo = self.currentMonthsDate()

        results = self.__userGmailAPI.users().messages().list(userId='me', q=self.__searchString
                                                                             + f" after:{dateFrom} before:{dateTo}").execute()
        emails = results.get('messages', [])

        if not emails:
            logging.info(f"No credit card transactions found for the range {dateFrom} to {dateTo} ")
            return {"Error": "No credit card transactions found."}
        for email in emails:
            r"Dear Customer, Your ICICI Bank Credit Card XX7001 has been used for a transaction of (.*?) on (.*?) at (.*?). Info: (.*?)."

            pattern = r"Dear Cardmember, (.*?) has been spent on your YES BANK (.*?) Card ending with 9467 at (.*?) on (.*?) at (.*?). Avl Bal INR"

            emailText = self.__userGmailAPI.users().messages().get(userId="me", id=email['id']).execute()[
                'snippet']
            matches = re.findall(pattern, emailText)
            if matches:
                for match in matches:
                    amount, card_type, vendor, date, time = match
                    # Date here is in the format dd-mm-yyyy, change it to mm-dd-yyyy
                    date_obj = datetime.datetime.strptime(date, '%d-%m-%Y')
                    modifiedDate = date_obj.strftime('%d/%m/%Y')
                    amount = float(amount.replace("INR ", ""))
                    if card_type == "Credit":
                        debitTransactions.append((modifiedDate, vendor, amount, " ", "YES Bank"))
            else:
                continue

        logging.info(f"YES Bank Parser finished parsing email. {len(debitTransactions)} transactions read.")

        return self.transactionInstance.updateLiveTable(debitTransactions)
