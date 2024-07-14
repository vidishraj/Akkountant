FROM python:3.9-slim
COPY --from=openjdk:8-jre-slim /usr/local/openjdk-8 /usr/local/openjdk-8

ENV JAVA_HOME /usr/local/openjdk-8

RUN update-alternatives --install /usr/bin/java java /usr/local/openjdk-8/bin/java 1
RUN apt-get update
RUN apt-get install -y curl

WORKDIR /Accountant

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .
EXPOSE 80
#EXPOSE 5000
#CMD ["flask","--app","main" , "run", "--host","0.0.0.0"]
CMD ["gunicorn","-w", "3","--timeout","600","main:app","--bind" ,"0.0.0.0:80"]
