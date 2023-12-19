import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { showNotify } from '../utils/notify';

function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nume, setNume] = useState('');
    const [prenume, setPrenume] = useState('');
    const [toggleModal, setToggleModal] = useState(false);
    const [usedBtn, setUsedBtn] = useState(false);

    const textChangeModal = toggleModal ? 'Sign in' : 'Sign up';
    const textChangeModalx = toggleModal ? 'Sign up' : 'Sign in';

    const updateToken = (token) => {
        try {
            axios.post('http://localhost:8080/token', {
                token,
                email,
            });
        } catch (error) {
            console.error('Error updating token:', error);
        }
    };


    const handleClickBtn = (type) => {
        if (usedBtn) {
            return;
        }
        setUsedBtn(true);
        switch (type) {
            case 'signin': {
                axios.post('http://localhost:8080/login', {
                    email,
                    password,
                })
                    .then(async (res) => {
                        const data = res.data;

                        if (data.message !== "LoginSuccessful") {
                            showNotify(`Username sau parola incorecta`, 2000, 'error');
                            setUsedBtn(false);
                            return;
                        }
                        const user = { id: data.id, email: data.email };
                        const userString = JSON.stringify(user);
                        const encryptedUser = CryptoJS.AES.encrypt(userString, 'pulapestetine').toString();
                        localStorage.setItem('token', encryptedUser, { expires: 1 / 24 });
                        showNotify(`${email} You logged in successfully`, 2000, 'success');
                        updateToken(encryptedUser);

                    })
                    .catch((error) => {
                        console.log(error);
                    })
                break;
            }
            case 'signup': {
                axios.post('http://localhost:8080/register', {
                    email,
                    nume,
                    prenume,
                    password,
                })
                    .then(() => {
                        setToggleModal(!toggleModal);
                    })
                    .catch((error) => {
                        console.error('Registration failed:', error);
                        setUsedBtn(false);
                        if (error.response) {
                            console.log('Server responded with:', error.response.data);
                        } else if (error.request) {
                            console.log('No response received from the server');
                        } else {
                            console.log('Error setting up the request:', error.message);
                        }
                    });

                break;
            }
        }
    }
    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <span className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    Shop
                </span>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            {textChangeModalx}
                        </h1>
                        <form className="space-y-4 md:space-y-6" action="#">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">E-Mail</label>
                                <input onChange={(e) => setEmail(e.target.value)} type="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@gmail.com" required="" />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Parola</label>
                                <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                            </div>
                            {toggleModal && (
                                <>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nume</label>
                                        <input onChange={(e) => setNume(e.target.value)} type="input" placeholder="Jhon" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Prenume</label>
                                        <input onChange={(e) => setPrenume(e.target.value)} type="input" placeholder="Doe" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                    </div>
                                </>

                            )}
                            <p type="submit" onClick={() => handleClickBtn(toggleModal ? 'signup' : 'signin')} className="cursor-pointer w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">{textChangeModalx}</p>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don’t have an account yet? <span onClick={() => setToggleModal(!toggleModal)} className="font-medium text-primary-600 hover:underline dark:text-primary-500 cursor-pointer">{textChangeModal}</span>
                            </p>
                        </form>
                    </div>
                </div>
            </div >
        </section >
    );
}

export default Auth;