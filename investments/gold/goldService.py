from datetime import datetime
import requests
from bs4 import BeautifulSoup
from investments.gold.goldHandler import GoldHandler
from util.logger import logging


def webScrapeGoldRates():
    try:
        logging.info("Making request to fetch gold Rates")
        url = "https://www.vaibhavjewellers.com/gold-rate"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/91.0.4472.124 Safari/537.36 "
        }
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            rows = soup.find('div', class_='metal-table').find('tbody').find_all('tr')
            gold_prices = {}
            for row in rows:
                columns = row.find_all('td')
                metal_type = columns[0].text
                purity = columns[1].text[0:2]
                price = columns[2].text.split()[0]
                if metal_type == 'Gold':
                    gold_prices[purity] = price

            logging.info(f"Fetched rates {gold_prices}")
            return gold_prices
        else:
            logging.error(f"Failed to retrieve the page. Status code: {response.status_code}")
            return {}
    except Exception as ex:
        logging.error(f"Failed to retrieve latest gold prices. {ex}")
        return {}


class GoldService:
    Handler: GoldHandler

    def __init__(self, goldHandler: GoldHandler):
        self.Handler = goldHandler

    def fetchAllDeposits(self):
        return self.Handler.fetchAllGold()

    def fetchGoldRates(self):
        return self.Handler.fetchAllGoldRates()

    def insertGoldDeposit(self, purchaseDate, itemDesc, goldType, amount, quantity):
        if amount < 0 or quantity < 0:
            return False
        try:
            datetime.strptime(purchaseDate, '%d/%m/%Y')
        except ValueError:
            return False
        if goldType != "22" and goldType != "20" and goldType != "18":
            return False
        return self.Handler.insertGoldPurchase(tuple([purchaseDate, itemDesc, goldType, amount, quantity]))

    def deletePurchase(self, depositID):
        return self.Handler.deleteDeposits(depositID)

    def recalibrateGoldRates(self):
        try:
            rateDict: dict = webScrapeGoldRates()
            globalTrue = False
            currentTime = datetime.now().strftime('%d/%m/%Y %H:%M')
            for key in rateDict.keys():
                logging.info(f"Calling rate Handler for {key}, {rateDict[key]}")
                successValue = self.Handler.insertGoldRate(tuple([currentTime, key, rateDict[key]]))
                if successValue:
                    globalTrue = True
                logging.info(f"Rate Handler returned status {successValue}")
            return globalTrue
        except Exception as ex:
            logging.error(f"Error while recalibrating gold rates {ex}")
            return False
