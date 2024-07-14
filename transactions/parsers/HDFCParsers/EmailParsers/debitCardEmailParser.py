from transactions.DBHandlers.HDFCTransactionHandler import HDFCTransactionHandler
from util.logger import logging
from googleapiclient.discovery import build
import datetime


class HDFCDebitEmailParser:
    """
    The job of this class is to just parse the mail of the user and find all the mails related to
    the debit card usage.
    """

    __searchString: str = "You have done a UPI txn. Check details!"
    __userGmailAPI: build

    def __init__(self, gmailAPIInstance: build, transactionInstance: HDFCTransactionHandler):
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
        logging.info("-----Starting the Debit Transaction Parsing-----")
        debitTransactions: list = []

        if dateFrom is None or dateTo is None:
            dateFrom, dateTo = self.currentMonthsDate()

        results = self.__userGmailAPI.users().messages().list(userId='me', q=self.__searchString
                                                                             + f" after:{dateFrom} before:{dateTo}").execute()
        emails = results.get('messages', [])

        if not emails:
            logging.info(f"No debit card transactions found for the range {dateFrom} to {dateTo} ")
            return {"Error": "No debit card transactions found."}
        for email in emails:
            emailText = self.__userGmailAPI.users().messages().get(userId="me", id=email['id']).execute()[
                'snippet']
            if "has been debited" in emailText:
                emailText = emailText.replace(",", " ")
                emailText = emailText.replace(".", " ")
                emailText = emailText.split()
                referenceNumber: int = 0
                date: datetime = ""
                description: str = ""
                amount: float = 0
                tag = ""
                bank = "HDFC Debit"
                for index, text in enumerate(emailText):
                    if "Rs" in text:
                        amount = float(emailText[index + 1] + "." + emailText[index + 2])
                    elif text == "VPA":
                        tempIndex = index + 1
                        while emailText[tempIndex] != "on":
                            description += emailText[tempIndex] + "."
                            tempIndex += 1
                    elif text == "Please":
                        referenceNumber = emailText[index - 1]
                    elif len(text) == 8 and text.count('-') == 2:
                        date = datetime.datetime.strptime(text, '%d-%m-%y').date().strftime("%d/%m/%Y")

                if description == "":
                    description = "Account Transfer"

                debitTransactions.append((date, description, amount, tag, bank))

        logging.info(f"Debit Parser finished parsing email. {len(debitTransactions)} transactions read.")
        return self.transactionInstance.updateLiveTable(debitTransactions)
