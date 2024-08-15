import json
import os
import random
import mysql.connector
from util.logger import logging
from mysql.connector.pooling import MySQLConnectionPool

InstanceList = []


def load_config_file(file_path):
    with open(file_path, 'r') as json_file:
        return json.load(json_file)


def load_config_with_env_override(config: dict, env):
    googleCheck = False
    for key, value in config.items():
        if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
            env_var_name = value[2:-1]
            if env_var_name.startswith("google"):
                googleCheck = True
            if key == "redirect_uris" or key == "javascript_origins":
                env_var_value = env.get(env_var_name).replace("'", "").split(',')
            else:
                env_var_value = env.get(env_var_name)
            if env_var_value:
                config[key] = env_var_value
    if googleCheck:
        configValues = config.copy()
        config.clear()
        config['google'] = configValues
    return config


def configReader():
    config_files = [
        'config/dbConfig.json',
        'transactions/GDriveUploader/folderConfig.json',
        'transactions/GDriveUploader/credentials.json',
        'transactions/GmailAPI/credentials.json',
        'config/parserStatementPasswords.json'
    ]
    configs = [load_config_file(file) for file in config_files]
    env = os.environ
    for cfg in configs:
        load_config_with_env_override(cfg, env)
    return {k: v for cfg in configs for k, v in cfg.items()}


Config = configReader()

if os.environ.get("api_key") is None:
    logging.error("Api key is missing in env variables. No request will pass")
else:
    Config['api_key'] = os.environ.get("api_key")


def dropSleepingConnections(singleConnection, userName):
    try:
        logging.info(f"Deleting sleeping connections for user {userName}")
        cursor = singleConnection.cursor()
        singleConnection.commit()
        cursor.execute("SELECT Id FROM INFORMATION_SCHEMA.PROCESSLIST WHERE command='Sleep' AND "
                       f"DB IS NOT NULL AND User= '{userName}' ")
        processList = cursor.fetchall()
        if len(processList) > 0:
            for process in processList:
                try:
                    logging.info(f"Killing connection {process[0]}")
                    cursor.execute(f"CALL mysql.rds_kill('{process[0]}')")
                except Exception as ex:
                    logging.info(f"Error --{ex}-- while killing process {process}. Popping process anyways.")

        singleConnection.commit()
        cursor.close()
        singleConnection.close()
        logging.info(f"Deleted connections successfully for user {userName}")
    except Exception as ex:
        logging.info(f"Error while dropping sleeping connections as well. {ex}")
        singleConnection.close()


class DBConnector:
    Pool: MySQLConnectionPool
    userName: str

    def __init__(self, jsonConfig):
        self.config = jsonConfig
        self.userName = ""
        self.Pool = self.createConnection()

    def reConnectDB(self):
        try:
            singleConnection = self.getSingleConnection()
            dropSleepingConnections(singleConnection, self.userName)
            self.Pool = self.createConnection()
            return True
        except:
            return False

    def getSingleConnection(self):
        try:
            dbConfig = {
                "host": self.config['host'],
                "port": int(self.config['port']),
                "user": self.config['adminUser'],
                "password": self.config['adminPassword'],
                "database": self.config['schema'],
                'connection_timeout': 600
            }
            return mysql.connector.connect(**dbConfig)
        except Exception as ex:
            logging.info(f"Error getting single connection as well {ex}s")

    def createConnection(self):
        try:
            if self.userName == "":
                for i in range(1, 4):
                    try:
                        logging.info(f"Trying a new connections to user queryUser{i}")
                        dbConfig = {
                            "host": self.config['host'],
                            "port": int(self.config['port']),
                            "user": f"{self.config['username']}{i}",
                            "password": self.config['password'],
                            "database": self.config['schema']
                        }
                        pool = mysql.connector.pooling.MySQLConnectionPool(
                            pool_name=f"pool{random.randint(1000, 9999)}", pool_size=14, **dbConfig)
                        logging.info(f"Login with user {i} successful")
                        self.userName = f"queryUser{i}"
                        return pool
                    except Exception as ex:
                        logging.info(f"Login with user {i} failed. Retrying......\n"
                                     f"{ex}")
            else:
                dbConfig = {
                    "host": self.config['host'],
                    "port": int(self.config['port']),
                    "user": self.userName,
                    "password": self.config['password'],
                    "database": self.config['schema']
                }
                pool = mysql.connector.pooling.MySQLConnectionPool(
                    pool_name=f"pool{random.randint(1000, 9999)}", pool_size=15, **dbConfig)
                logging.info(f"New pool created with user {self.userName} successfully")
                return pool
        except Exception as ex:
            logging.error(f"Error while creating connection to db. {ex}")


logging.info("Starting DB connection attempt")
ConnectionPool = DBConnector(Config)
logging.info("Successfully established connections.")


def reConnectDB():
    try:
        return ConnectionPool.reConnectDB()
    except Exception as ex:
        logging.info(f"Error while reconnection to db as well. {ex}")


def getConnection():
    try:
        connection = ConnectionPool.Pool.get_connection()
        return connection
    except Exception as ex:
        logging.info(f"Error while getting connection {ex}")
        ConnectionPool.reConnectDB()
