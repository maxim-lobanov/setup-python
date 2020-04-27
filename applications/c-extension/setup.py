from setuptools import setup, Extension

spam_module = Extension('spam', sources=['spammodule.c'])

setup(
    name='spam',
    version='2.0.0',
    author='brcrista',
    url='https://github.com/brcrista/Python-C-Extension',
    ext_modules=[spam_module])
