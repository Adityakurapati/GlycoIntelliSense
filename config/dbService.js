import { db } from './firebase';
import
        {
                ref,
                set,
                update,
                remove,
                push,
                get,
                query,
                orderByChild,
                equalTo
        } from 'firebase/database';
import * as FileSystem from 'expo-file-system';

// Reference path
const BLOOD_SUGAR_REF='bloodSugarReadings';

// Define the prescriptions directory
const PRESCRIPTIONS_DIR=`${ FileSystem.documentDirectory }prescriptions/`;

// Ensure prescriptions directory exists
const ensurePrescriptionsDirectoryExists=async () =>
{
        const dirInfo=await FileSystem.getInfoAsync( PRESCRIPTIONS_DIR );
        if ( !dirInfo.exists )
        {
                await FileSystem.makeDirectoryAsync( PRESCRIPTIONS_DIR, { intermediates: true } );
        }
};

// Check if user has any readings and create default if none
export const ensureUserHasReadings=async ( userId ) =>
{
        try
        {
                const readings=await getBloodSugarReadings( userId );

                // If no readings exist, create a default one
                if ( !readings||readings.length===0 )
                {
                        console.log( "No readings found for user, creating default entry" );

                        // Create a default reading
                        await addBloodSugarReading( userId, {
                                value: 0, // Default value
                                mealStatus: "fasting", // Default meal status
                                notes: "Initial reading", // Default note
                                timestamp: Date.now() // Current timestamp as default
                        }, null );

                        return true;
                }

                return false;
        } catch ( error )
        {
                console.error( "Error ensuring user has readings: ", error );
                // Still create a default entry if there was an error fetching
                try
                {
                        await addBloodSugarReading( userId, {
                                value: 0,
                                mealStatus: "fasting",
                                notes: "Initial reading",
                                timestamp: Date.now() // Current timestamp as default
                        }, null );
                } catch ( innerError )
                {
                        console.error( "Error creating default reading: ", innerError );
                }
                return true;
        }
};

// Firebase Realtime Database functions
export const getBloodSugarReadings=async ( userId ) =>
{
        try
        {
                const bloodSugarRef=ref( db, BLOOD_SUGAR_REF );
                const userReadingsQuery=query(
                        bloodSugarRef,
                        orderByChild( 'userId' ),
                        equalTo( userId )
                );

                const snapshot=await get( userReadingsQuery );
                const readings=[];

                if ( snapshot.exists() )
                {
                        snapshot.forEach( ( childSnapshot ) =>
                        {
                                const data=childSnapshot.val();
                                readings.push( {
                                        id: childSnapshot.key,
                                        value: data.value,
                                        timestamp: data.timestamp,
                                        mealStatus: data.mealStatus,
                                        notes: data.notes,
                                        prescriptionImageUrl: data.prescriptionImageUrl
                                } );
                        } );

                        // Sort by timestamp manually since Realtime Database can only order by one field
                        readings.sort( ( a, b ) => b.timestamp-a.timestamp );
                }

                return readings;
        } catch ( error )
        {
                console.error( "Error fetching blood sugar readings: ", error );
                throw error;
        }
};

export const addBloodSugarReading=async ( userId, readingData, prescriptionImageUri ) =>
{
        try
        {
                let prescriptionImageUrl=null;

                // Save image locally if provided
                if ( prescriptionImageUri )
                {
                        prescriptionImageUrl=await savePrescriptionImage( userId, prescriptionImageUri );
                }

                // Create a new entry with a unique key
                const newReadingRef=push( ref( db, BLOOD_SUGAR_REF ) );
                const readingId=newReadingRef.key;

                // Add data to Firebase Realtime Database
                await set( newReadingRef, {
                        userId,
                        value: Number( readingData.value||0 ),  // Default to 0 if no value provided
                        // Use provided timestamp or current time as fallback
                        timestamp: readingData.timestamp||Date.now(),
                        mealStatus: readingData.mealStatus||"fasting",  // Default mealStatus
                        notes: readingData.notes||"",  // Default empty notes
                        prescriptionImageUrl
                } );

                return readingId;
        } catch ( error )
        {
                console.error( "Error adding blood sugar reading: ", error );
                throw error;
        }
};

// Rest of the functions remain unchanged
export const updateBloodSugarReading=async ( readingId, readingData, prescriptionImageUri ) =>
{
        try
        {
                const readingRef=ref( db, `${ BLOOD_SUGAR_REF }/${ readingId }` );
                const updateData={ ...readingData };

                // Update image if provided
                if ( prescriptionImageUri&&prescriptionImageUri.startsWith( 'file://' ) )
                {
                        const prescriptionImageUrl=await savePrescriptionImage(
                                readingData.userId,
                                prescriptionImageUri
                        );
                        updateData.prescriptionImageUrl=prescriptionImageUrl;
                }

                await update( readingRef, updateData );
                return true;
        } catch ( error )
        {
                console.error( "Error updating blood sugar reading: ", error );
                throw error;
        }
};

export const deleteBloodSugarReading=async ( readingId, prescriptionImageUrl ) =>
{
        try
        {
                // Delete image locally if exists
                if ( prescriptionImageUrl )
                {
                        await deletePrescriptionImage( prescriptionImageUrl );
                }

                // Delete data from Firebase Realtime Database
                const readingRef=ref( db, `${ BLOOD_SUGAR_REF }/${ readingId }` );
                await remove( readingRef );

                return true;
        } catch ( error )
        {
                console.error( "Error deleting blood sugar reading: ", error );
                throw error;
        }
};

// Local file storage functions (unchanged)
export const savePrescriptionImage=async ( userId, uri ) =>
{
        try
        {
                // Ensure directory exists
                await ensurePrescriptionsDirectoryExists();

                // Generate a unique filename based on userId and timestamp
                const timestamp=new Date().getTime();
                const filename=`${ userId }_${ timestamp }.jpg`;
                const destinationUri=`${ PRESCRIPTIONS_DIR }${ filename }`;

                // Copy file to prescriptions directory
                await FileSystem.copyAsync( {
                        from: uri,
                        to: destinationUri
                } );

                return destinationUri;
        } catch ( error )
        {
                console.error( "Error saving image locally: ", error );
                throw error;
        }
};

export const deletePrescriptionImage=async ( imageUrl ) =>
{
        try
        {
                // Check if file exists
                const fileInfo=await FileSystem.getInfoAsync( imageUrl );
                if ( fileInfo.exists )
                {
                        // Delete file
                        await FileSystem.deleteAsync( imageUrl );
                }
                return true;
        } catch ( error )
        {
                console.error( "Error deleting image: ", error );
                throw error;
        }
};

export const getPrescriptionImage=async ( imageUrl ) =>
{
        try
        {
                if ( !imageUrl ) return null;

                // Check if file exists
                const fileInfo=await FileSystem.getInfoAsync( imageUrl );
                if ( !fileInfo.exists )
                {
                        console.warn( "Prescription image not found:", imageUrl );
                        return null;
                }

                return imageUrl;
        } catch ( error )
        {
                console.error( "Error getting image: ", error );
                throw error;
        }
};