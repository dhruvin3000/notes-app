'use client';

import {
    useState
} from 'react';
import {
    useRouter
} from 'next/navigation';
import Link from 'next/link';
import {
    apiLogin
} from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiLogin(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return ( <
        div className = "flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8" >
        <
        div className = "w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md" >
        <
        div >
        <
        h2 className = "mt-6 text-center text-3xl font-bold tracking-tight text-gray-900" >
        Sign in to Notes <
        /h2> <
        p className = "mt-2 text-center text-sm text-gray-600" >
        Don & apos; t have an account ? {
            ' '
        } <
        Link href = "/register"
        className = "font-medium text-blue-600 hover:text-blue-500" >
        Register here <
        /Link> <
        /p> <
        /div>

        {
            error && ( <
                div className = "rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700" > {
                    error
                } <
                /div>
            )
        }

        <
        form className = "mt-8 space-y-5"
        onSubmit = {
            handleSubmit
        } >
        <
        div >
        <
        label htmlFor = "email"
        className = "block text-sm font-medium text-gray-700 mb-1" >
        Email address <
        /label> <
        input id = "email"
        type = "email"
        autoComplete = "email"
        required value = {
            email
        }
        onChange = {
            (e) => setEmail(e.target.value)
        }
        className = "block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm"
        placeholder = "you@example.com" /
        >
        <
        /div>

        <
        div >
        <
        label htmlFor = "password"
        className = "block text-sm font-medium text-gray-700 mb-1" >
        Password <
        /label> <
        input id = "password"
        type = "password"
        autoComplete = "current-password"
        required value = {
            password
        }
        onChange = {
            (e) => setPassword(e.target.value)
        }
        className = "block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm"
        placeholder = "••••••••" /
        >
        <
        /div>

        <
        button type = "submit"
        disabled = {
            loading
        }
        className = "flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition" >
        {
            loading ? 'Signing in…' : 'Sign in'
        } <
        /button> <
        /form> <
        /div> <
        /div>
    );
}