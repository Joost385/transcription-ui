FROM python:3.11 as cpu
RUN apt-get update && apt-get install -y libsndfile1 ffmpeg
WORKDIR /app
RUN pip install --no-cache-dir Cython==3.0.6
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ARG PYDANTIC_VERSION
RUN pip install --no-cache-dir pydantic==${PYDANTIC_VERSION}
COPY app/ .

FROM nvidia/cuda:12.2.2-cudnn8-runtime-ubuntu22.04 as cuda
RUN apt-get update && apt-get install -y \
      python3.11 \
      python3-pip \
      python3.11-dev \
      libsndfile1 \
      ffmpeg
RUN ln -s /usr/bin/python3.11 /usr/bin/python
WORKDIR /app
RUN pip install --no-cache-dir Cython==3.0.6
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ARG PYDANTIC_VERSION
RUN pip install --no-cache-dir pydantic==${PYDANTIC_VERSION}
COPY app/ .