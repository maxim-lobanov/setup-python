#define PY_SSIZE_T_CLEAN
#include <Python.h>

// A custom exception type for this module.
static PyObject* spam_error;

//! Call the C `system` function with the arguments in `args`.
static PyObject* spam_system(PyObject* self, PyObject* args)
{
    const char* command;
    if (!PyArg_ParseTuple(args, "s", &command))
    {
        // In this case, PyArg_ParseTuple has already set the exception.
        // NULL is a sentinel value for "error".
        // To return the Python None value, use
        //   PyINCREF(Py_None);
        //   return Py_None;
        return NULL;
    }

    int sts = system(command);
    if (sts < 0)
    {
        PyErr_SetString(spam_error, "Call to `system()` failed");
        return NULL;
    }

    // Return the value as a Python object (an integer).
    return PyLong_FromLong(sts);
}

// The module's method table
static PyMethodDef SpamMethods[] =
{
    { "system", spam_system, METH_VARARGS, "Execute a command on the underlying shell." },
    { NULL, NULL, 0, NULL } // Sentinel
};

// The module's definition
static struct PyModuleDef spammodule =
{
    PyModuleDef_HEAD_INIT,
    "spam", // name of the module
    NULL, // module documentation
    -1, // the module keeps state in global variables
    SpamMethods
};

//! The initialization function for the `spam` module.
PyMODINIT_FUNC PyInit_spam(void)
{
    PyObject* module = PyModule_Create(&spammodule);
    if (module == NULL)
    {
        return NULL;
    }

    // The Python name for the exception type is `spam.SpamError`
    // with a base class of `Exception`.
    spam_error = PyErr_NewException("spam.SpamError", NULL, NULL);

    // Make sure the `spam.SpamError` type object does not get garbage collected
    // if some Python code deletes it from the module.
    Py_INCREF(spam_error);

    PyModule_AddObject(module, "SpamError", spam_error);
    return module;
}
