
import { Session } from '@supabase/supabase-js';
import { profileService } from '@/services/profileService';
import { Profile } from './types';

export const createTemporaryProfile = (session: Session): Profile => {
  console.log('🔧 Creating temporary profile for session:', session.user.id);
  return {
    id: session.user.id,
    email: session.user.email!,
    first_name: session.user.user_metadata?.first_name || 'Utilisateur',
    last_name: session.user.user_metadata?.last_name || '',
    role: session.user.user_metadata?.role || 'admin' // Force admin pour les tests
  };
};

export const createProfileFromMetadata = async (session: Session): Promise<Profile | null> => {
  if (!session.user.user_metadata && !session.user.email) {
    console.log('⚠️ No user metadata or email found, cannot create profile');
    return null;
  }

  console.log('📝 Creating profile from user metadata:', session.user.user_metadata);
  
  // Pour le compte admin spécifique, on force le rôle admin
  const isAdminEmail = session.user.email === 'reine.elie@gmail.com';
  
  const userData = {
    email: session.user.email!,
    first_name: session.user.user_metadata?.first_name || (isAdminEmail ? 'Reine' : 'Utilisateur'),
    last_name: session.user.user_metadata?.last_name || (isAdminEmail ? 'Elie' : ''),
    role: isAdminEmail ? 'admin' : (session.user.user_metadata?.role || 'user')
  };

  try {
    const profileData = await profileService.upsertProfile(session.user.id, userData);
    console.log('✅ Profile created/updated from metadata:', profileData);
    return profileData;
  } catch (createError) {
    console.error('❌ Error creating profile from metadata:', createError);
    return createTemporaryProfile(session);
  }
};

export const fetchOrCreateProfile = async (session: Session): Promise<Profile | null> => {
  try {
    console.log('👤 Fetching or creating profile for user:', session.user.id);
    
    // Essayer de récupérer le profil existant avec retry
    let profileData = await profileService.fetchProfile(session.user.id);

    if (!profileData) {
      console.log('❌ No existing profile found, attempting to create one');
      profileData = await createProfileFromMetadata(session);
      
      if (!profileData) {
        console.log('⚠️ Could not create profile from metadata, using temporary profile');
        profileData = createTemporaryProfile(session);
      }
    } else {
      console.log('✅ Existing profile found:', profileData);
      
      // Si c'est le compte admin, s'assurer que le rôle est bien admin
      if (session.user.email === 'reine.elie@gmail.com' && profileData.role !== 'admin') {
        console.log('🔧 Fixing admin role for reine.elie@gmail.com');
        try {
          profileData = await profileService.upsertProfile(session.user.id, {
            ...profileData,
            role: 'admin'
          });
        } catch (error) {
          console.error('❌ Could not fix admin role:', error);
        }
      }
    }

    return profileData;
  } catch (error) {
    console.error('💥 Error in fetchOrCreateProfile:', error);
    console.log('🔧 Falling back to temporary profile');
    return createTemporaryProfile(session);
  }
};
