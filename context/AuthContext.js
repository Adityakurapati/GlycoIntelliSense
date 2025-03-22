import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../config/firebase";
import
        {
                createUserWithEmailAndPassword,
                signInWithEmailAndPassword,
                signOut,
                onAuthStateChanged,
                sendPasswordResetEmail,
                updateProfile
        } from "firebase/auth";
import { ref, set, get, child } from "firebase/database";
import { getDatabase } from "firebase/database";

const AuthContext=createContext();

export function useAuth ()
{
        return useContext( AuthContext );
}

export function AuthProvider ( { children } )
{
        const [ user, setUser ]=useState( null );
        const [ loading, setLoading ]=useState( true );
        const database=getDatabase();

        // Listen for auth state changes
        useEffect( () =>
        {
                const unsubscribe=onAuthStateChanged( auth, async ( currentUser ) =>
                {
                        if ( currentUser )
                        {
                                // Get additional user data from Realtime Database
                                try
                                {
                                        const dbRef=ref( database );
                                        const snapshot=await get( child( dbRef, `users/${ currentUser.uid }` ) );

                                        if ( snapshot.exists() )
                                        {
                                                // Combine auth user with database user data
                                                setUser( {
                                                        ...currentUser,
                                                        ...snapshot.val(),
                                                        uid: currentUser.uid
                                                } );
                                        } else
                                        {
                                                setUser( currentUser );
                                        }
                                } catch ( error )
                                {
                                        console.error( "Error fetching user data:", error );
                                        setUser( currentUser );
                                }
                        } else
                        {
                                setUser( null );
                        }
                        setLoading( false );
                } );

                return unsubscribe;
        }, [ database ] );

        // Register a new user
        const register=async ( email, password, displayName ) =>
        {
                try
                {
                        // Create user in Firebase Auth
                        const userCredential=await createUserWithEmailAndPassword( auth, email, password );

                        // Update profile with display name
                        await updateProfile( userCredential.user, { displayName } );

                        // Store additional user data in Realtime Database
                        await set( ref( database, `users/${ userCredential.user.uid }` ), {
                                email,
                                displayName,
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString()
                        } );

                        return userCredential.user;
                } catch ( error )
                {
                        throw error;
                }
        };

        // Sign in existing user
        const login=async ( email, password ) =>
        {
                try
                {
                        const userCredential=await signInWithEmailAndPassword( auth, email, password );

                        // Update last login in Realtime Database
                        await set( ref( database, `users/${ userCredential.user.uid }/lastLogin` ), new Date().toISOString() );

                        return userCredential.user;
                } catch ( error )
                {
                        throw error;
                }
        };

        // Sign out user
        const logout=() =>
        {
                return signOut( auth );
        };

        // Reset password
        const resetPassword=( email ) =>
        {
                return sendPasswordResetEmail( auth, email );
        };

        // Update user profile
        const updateUserProfile=async ( userData ) =>
        {
                if ( !user ) throw new Error( "No user logged in" );

                try
                {
                        // Update display name in Auth if provided
                        if ( userData.displayName )
                        {
                                await updateProfile( auth.currentUser, {
                                        displayName: userData.displayName
                                } );
                        }

                        // Update user data in Realtime Database
                        const updates={ ...userData };
                        delete updates.email; // Email can't be updated directly here

                        await set( ref( database, `users/${ user.uid }` ), {
                                ...user,
                                ...updates,
                                updatedAt: new Date().toISOString()
                        } );

                        return true;
                } catch ( error )
                {
                        throw error;
                }
        };

        const value={
                user,
                register,
                login,
                logout,
                resetPassword,
                updateUserProfile,
                loading
        };

        return (
                <AuthContext.Provider value={ value }>
                        { !loading&&children }
                </AuthContext.Provider>
        );
}