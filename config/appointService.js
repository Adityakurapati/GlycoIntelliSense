// appointmentService.js
"use client";

import { db } from "./firebase"; // Assuming firebase.js exports the Realtime Database instance
import { ref, get, push, update, query, orderByChild, equalTo } from "firebase/database";

/**
 * Fetches all appointments from Realtime Database.
 * @returns {Promise<Appointment[]>} - Array of appointments.
 */
export const fetchAppointments=async () =>
{
        try
        {
                const appointmentsRef=ref( db, "appointments" );
                const snapshot=await get( appointmentsRef );
                if ( snapshot.exists() )
                {
                        const appointments=Object.entries( snapshot.val() ).map( ( [ id, data ] ) => ( {
                                id,
                                ...data,
                        } ) );
                        return appointments;
                } else
                {
                        return [];
                }
        } catch ( error )
        {
                console.error( "Error fetching appointments:", error );
                throw error;
        }
};

/**
 * Fetches all labs from Realtime Database.
 * @returns {Promise<Lab[]>} - Array of labs.
 */
export const fetchLabs=async () =>
{
        try
        {
                const labsRef=ref( db, "labs" );
                const snapshot=await get( labsRef );
                if ( snapshot.exists() )
                {
                        const labs=Object.entries( snapshot.val() ).map( ( [ id, data ] ) => ( {
                                id,
                                ...data,
                        } ) );
                        return labs;
                } else
                {
                        return [];
                }
        } catch ( error )
        {
                console.error( "Error fetching labs:", error );
                throw error;
        }
};

/**
 * Books a new appointment in Realtime Database.
 * @param {Appointment} appointment - The appointment object to be booked.
 * @returns {Promise<void>}
 */
export const bookNewAppointment=async ( appointment ) =>
{
        try
        {
                const appointmentsRef=ref( db, "appointments" );
                const newAppointmentRef=push( appointmentsRef );
                await update( newAppointmentRef, appointment );
        } catch ( error )
        {
                console.error( "Error booking appointment:", error );
                throw error;
        }
};

/**
 * Cancels a user's appointment in Realtime Database.
 * @param {string} id - The ID of the appointment to cancel.
 * @returns {Promise<void>}
 */
export const cancelUserAppointment=async ( id ) =>
{
        try
        {
                const appointmentRef=ref( db, `appointments/${ id }` );
                await update( appointmentRef, { status: "cancelled" } );
        } catch ( error )
        {
                console.error( "Error cancelling appointment:", error );
                throw error;
        }
};

/**
 * Fetches all users enrolled in a lab from Realtime Database.
 * @returns {Promise<any[]>} - Array of lab users.
 */
export const fetchLabUsers=async () =>
{
        try
        {
                const usersRef=ref( db, "users" );
                const q=query( usersRef, orderByChild( "role" ), equalTo( "lab_user" ) );
                const snapshot=await get( q );
                if ( snapshot.exists() )
                {
                        const users=Object.entries( snapshot.val() ).map( ( [ id, data ] ) => ( {
                                id,
                                ...data,
                        } ) );
                        return users;
                } else
                {
                        return [];
                }
        } catch ( error )
        {
                console.error( "Error fetching lab users:", error );
                throw error;
        }
};