import { db } from '../config/firebase';
import { ref, push, set, onValue, remove, update, get } from 'firebase/database';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up notifications configuration
export const setupNotifications=async () =>
{
        Notifications.setNotificationHandler( {
                handleNotification: async () => ( {
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                } ),
        } );

        // Request permissions (required for iOS)
        if ( Platform.OS==='ios' )
        {
                const { status }=await Notifications.requestPermissionsAsync();
                if ( status!=='granted' )
                {
                        throw new Error( 'Notification permissions not granted' );
                }
        }
};

// Parse time string (e.g., "08:00 AM") into hour and minute
const parseTimeString=( timeStr ) =>
{
        // Split time string into time and period (AM/PM)
        const [ time, period ]=timeStr.split( ' ' );
        const [ hourStr, minuteStr ]=time.split( ':' );

        let hour=parseInt( hourStr, 10 );
        const minute=parseInt( minuteStr, 10 );

        // Convert to 24-hour format
        if ( period.toUpperCase()==='PM'&&hour<12 ) hour+=12;
        if ( period.toUpperCase()==='AM'&&hour===12 ) hour=0;

        return { hour, minute };
};

// Schedule a notification for a medication reminder
export const scheduleNotification=async ( medication ) =>
{
        // Handle case where timeOfDay might be undefined
        if ( !medication.timeOfDay||!Array.isArray( medication.timeOfDay )||medication.timeOfDay.length===0 )
        {
                return [];
        }

        const notificationIds=[];

        // Schedule notifications for each time
        for ( const timeStr of medication.timeOfDay )
        {
                try
                {
                        const { hour, minute }=parseTimeString( timeStr );

                        const notificationId=await Notifications.scheduleNotificationAsync( {
                                content: {
                                        title: `Medication Reminder: ${ medication.name }`,
                                        body: `Time to take ${ medication.dosage } of ${ medication.name }. ${ medication.notes? `Note: ${ medication.notes }`:'' }`,
                                        sound: true,
                                        priority: Notifications.AndroidNotificationPriority.HIGH,
                                        data: { medicationId: medication.id },
                                },
                                trigger: {
                                        hour: hour,
                                        minute: minute,
                                        repeats: true,
                                },
                        } );

                        notificationIds.push( notificationId );
                } catch ( error )
                {
                        console.error( `Error scheduling notification for ${ timeStr }:`, error );
                }
        }

        // Return the notification IDs for later cancellation if needed
        return notificationIds;
};

// Cancel scheduled notifications
export const cancelNotifications=async ( notificationIds ) =>
{
        if ( Array.isArray( notificationIds ) )
        {
                for ( const id of notificationIds )
                {
                        try
                        {
                                await Notifications.cancelScheduledNotificationAsync( id );
                        } catch ( error )
                        {
                                console.error( `Error canceling notification ${ id }:`, error );
                        }
                }
        }
};

// Add a new medication with reminders
export const addMedication=async ( medication, userId ) =>
{
        try
        {
                // Add reminder field
                const medicationWithReminder={
                        ...medication,
                        reminder: true, // Default to true for new medications
                        notificationIds: [], // Will store notification IDs
                };

                // Save to Firebase
                const medicationRef=ref( db, `medications/${ userId }` );
                const newMedicationRef=push( medicationRef );
                const newMedicationId=newMedicationRef.key;

                // Set the ID in the medication object
                medicationWithReminder.id=newMedicationId;

                // Schedule notifications
                const notificationIds=await scheduleNotification( medicationWithReminder );
                medicationWithReminder.notificationIds=notificationIds;

                // Save complete medication data with notification IDs
                await set( newMedicationRef, medicationWithReminder );

                return newMedicationId;
        } catch ( error )
        {
                console.error( "Error adding medication: ", error );
                throw error;
        }
};

// Update medication reminder status
export const updateMedicationReminder=async ( userId, medicationId, enableReminder ) =>
{
        try
        {
                const medicationRef=ref( db, `medications/${ userId }/${ medicationId }` );
                const snapshot=await get( medicationRef );

                if ( snapshot.exists() )
                {
                        const medication=snapshot.val();

                        // Cancel existing notifications if disabling reminders
                        if ( !enableReminder&&medication.notificationIds )
                        {
                                await cancelNotifications( medication.notificationIds );
                        }

                        // Schedule new notifications if enabling reminders
                        let notificationIds=[];
                        if ( enableReminder )
                        {
                                notificationIds=await scheduleNotification( { ...medication, id: medicationId } );
                        }

                        // Update the medication in Firebase
                        await update( medicationRef, {
                                reminder: enableReminder,
                                notificationIds: enableReminder? notificationIds:[]
                        } );
                }
        } catch ( error )
        {
                console.error( "Error updating medication reminder: ", error );
                throw error;
        }
};

// Fetch medications for a specific user
export const fetchMedications=( userId ) =>
{
        return new Promise( ( resolve, reject ) =>
        {
                const medicationsRef=ref( db, `medications/${ userId }` );

                onValue( medicationsRef, ( snapshot ) =>
                {
                        const medications=[];
                        if ( snapshot.exists() )
                        {
                                snapshot.forEach( ( childSnapshot ) =>
                                {
                                        medications.push( {
                                                id: childSnapshot.key,
                                                ...childSnapshot.val(),
                                        } );
                                } );
                        }
                        resolve( medications );
                }, ( error ) =>
                {
                        reject( error );
                } );
        } );
};

// Delete a medication
export const deleteMedication=async ( userId, medicationId ) =>
{
        try
        {
                // Get the medication to access the notification IDs
                const medicationRef=ref( db, `medications/${ userId }/${ medicationId }` );
                const snapshot=await get( medicationRef );

                if ( snapshot.exists() )
                {
                        const medication=snapshot.val();

                        // Cancel notifications if they exist
                        if ( medication.notificationIds&&medication.notificationIds.length>0 )
                        {
                                await cancelNotifications( medication.notificationIds );
                        }
                }

                // Remove the medication from Firebase
                await remove( medicationRef );
        } catch ( error )
        {
                console.error( "Error deleting medication: ", error );
                throw error;
        }
};