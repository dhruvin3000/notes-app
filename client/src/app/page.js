import Link from 'next/link';

export default function Home() {
    return ( <
        main className = "flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6" >
        <
        div className = "text-center max-w-lg" >
        <
        div className = "text-6xl mb-6" > 📝 < /div> <
        h1 className = "text-4xl font-bold text-gray-900 mb-3" > Notes App < /h1> <
        p className = "text-lg text-gray-500 mb-10" >
        A simple, fast, and personal note - taking app.Write.Save.Revisit. <
        /p> <
        div className = "flex gap-4 justify-center" >
        <
        Link href = "/login"
        className = "px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition" >
        Sign in
        <
        /Link> <
        Link href = "/register"
        className = "px-5 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition" >
        Create account <
        /Link> <
        /div> <
        /div> <
        /main>
    );
}