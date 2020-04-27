.PHONY: all
all: build install sdist wheel

.PHONY: build
build:
	python setup.py build

.PHONY: install
install:
	python setup.py install

.PHONY: sdist
sdist:
	python setup.py sdist

.PHONY: wheel
wheel:
	pip install wheel
	python setup.py bdist_wheel
