from __future__ import print_function


from transactions.DBHandlers.GoogleHandlers import GoogleHandlers
from util.logger import logging

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.exceptions import RefreshError
from util.dbConnector import Config

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']


class GmailApi:
    __ServiceInstance: build
    __AuthUrl: str = ""
    GoogleHandler: GoogleHandlers
    config: dict

    def __init__(self, googleInstance):
        self.config = Config
        self.__ServiceInstance = None
        self.GoogleHandler = googleInstance
        self.generateServiceInstance()

    def checkServiceInstance(self):
        tryCounts = 0
        while self.__ServiceInstance is None:
            self.generateServiceInstance()
            tryCounts += 1
            if tryCounts == 5:
                logging.error("Failed to get Gmail Instance.")
                return False
        return True

    def generateServiceInstance(self):
        """
        Sets the service instance by making a connection.
        """
        flowConfig = {
            "web": self.config['gmail']
        }
        flow = InstalledAppFlow.from_client_config(flowConfig, SCOPES)
        try:
            logging.info("-----Starting Gmail Service Instantiation-----")
            creds = Credentials.from_authorized_user_info(info=self.GoogleHandler.getGmailToken(), scopes=SCOPES)
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                    logging.info(f"Credentials not valid. Setting client flow. {flow.client_config}")
                    self.__AuthUrl = flow.client_config
                else:
                    logging.info(f"Credentials not valid. Setting client flow. {flow.client_config}")
                    self.__AuthUrl = flow.client_config
                    raise Exception("Credentials failed")
            self.__ServiceInstance = build('gmail', 'v1', credentials=creds)
            logging.info("-----Gmail Service Connection Established.-----")
            return self.__ServiceInstance
        except RefreshError as ex:
            logging.error(f"Error occurred with token.json. Please try again. -{ex}")
            self.__AuthUrl = flow.client_config
            return
        except Exception as ex:
            logging.error(f"Error while getting Gmail token. {ex}")
            self.__AuthUrl = flow.client_config
            return ex

    def getServiceInstance(self):
        try:
            return self.__ServiceInstance
        except:
            return self.__AuthUrl

    def getAuthUrl(self):
        return self.__AuthUrl