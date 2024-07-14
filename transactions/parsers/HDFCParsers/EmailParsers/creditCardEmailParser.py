import re

from transactions.DBHandlers.HDFCTransactionHandler import HDFCTransactionHandler
from util.logger import logging
from googleapiclient.discovery import build
import datetime


class CreditCardTransactionParser:
    """
    The job of this class is to just parse the mail of the user and find all the mails related to
    the credit card usage.
    """

    __searchString: str = "subject:(Alert : Update on your HDFC Bank Credit Card) after:"
    __userGmailAPI: build

    def __init__(self, gmailAPIInstance: build, transactionHandler:HDFCTransactionHandler):
        self.__userGmailAPI = gmailAPIInstance
        self.transactionHandler = transactionHandler

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

    def creditCardMailParser(self, dateFrom, dateTo):
        """
        This method will look for emails sent for credit card transactions, parse the information and then
        saves the information in the database.
        :return: null
        """
        if dateFrom is None or dateTo is None:
            dateFrom, dateTo = self.currentMonthsDate()
        logging.info("-----Starting the Credit Transaction Parsing-----")

        creditTransactions: list = []
        results = self.__userGmailAPI.users().messages().list(userId='me', q=self.__searchString +
                                                                             f"{dateFrom} before:{dateTo}").execute()
        emails = results.get('messages', [])

        if not emails:
            logging.info(f"No credit card transactions found for the range {dateFrom} to {dateTo} ")
            return {"Error": "No credit card transactions found."}
        for email in emails:
            emailText = self.__userGmailAPI.users().messages().get(userId="me", id=email['id']).execute()[
                'snippet']
            emailText = emailText.split()
            amount: float = 0.0
            desc: str = ""
            date: datetime
            tag = ""
            bank = "HDFC Credit"
            for index, text in enumerate(emailText):
                if "Rs" in text:
                    amount = float(re.sub(r'[^0-9.]', '', emailText[index + 1]))
                elif text.strip() == "at" and desc == "":
                    tempInd = index + 1
                    while emailText[tempInd].strip() != "on":
                        desc += emailText[tempInd] + " "
                        tempInd += 1
                    date = datetime.datetime.strptime(emailText[tempInd+1], '%d-%m-%Y').date().strftime("%d/%m/%Y")
                    creditTransactions.append((date, desc, amount, tag, bank))
                    break
        logging.info(f"Credit Parser finished parsing email. {len(creditTransactions)} transactions read.")
        logging.info(f"Statements read {creditTransactions}")
        return self.transactionHandler.updateLiveTable(creditTransactions)
