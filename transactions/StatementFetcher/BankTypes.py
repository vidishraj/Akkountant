from enum import Enum

"""
This enum is to map the SearchString used to search the mail along with their unique identifier 
used in the project.
BOI not implemented because BOI doesn't send statements on mail. 
"""


class BankTypes(Enum):
    ICICI_AMAZON_PAY = ("Amazon Pay ICICI Bank Credit Card Statement ", "ICICI")
    BOI = ("", "")
    HDFC_CREDIT = ("Millennia Credit Card Statement ", "HDFC_Credit")
    HDFC_DEBIT = ("Email Account Statement of your HDFC Bank Account ", "HDFC_Debit_PDF")
    YES_BANK_ACE = ("YES BANK ACE Credit Card E - Statement ", "YES_Credit")
    YES_Debit = ("YES BANK e-Statement", "YES_Debit")

    def __init__(self, searchString, bank):
        self.searchString = searchString
        self.bank = bank
