
import { Session } from '@supabase/supabase-js';
import { profileService } from '@/services/profileService';
import { Profile } from './types';

export const createTemporaryProfile = (session: Session): Profile => {
  return {
    id: session.user.id,
    email: session.user.email!,
    first_name: session.user.user_metadata?.first_name || 'Utilisateur',
    last_name: session.user.user_metadata?.last_name || '',
    role: session.user.user_metadata?.role || 'repairer'
  };
};

export const createProfileFromMetadata = async (session: Session): Promise<Profile | null> => {
  if (!session.user.user_metadata) {
    return null;
  }

  console.log('📝 Creating profile from user metadata');
  const userData = {
    email: session.user.email!,
    first_name: session.user.user_metadata.first_name,
    last_name: session.user.user_metadata.last_name,
    role: session.user.user_metadata.role || 'repairer'
  };

  try {
    const profileData = await profileService.createProfile(session.user.id, userData);
    console.log('✅ Profile created from metadata:', profileData);
    return profileData;
  } catch (createError) {
    console.error('❌ Error creating profile:', createError);
    return createTemporaryProfile(session);
  }
};

export const fetchOrCreateProfile = async (session: Session): Promise<Profile | null> => {
  try {
    console.log('👤 User found, fetching profile for:', session.user.id);
    let profileData = await profileService.fetchProfile(session.user.id);

    if (!profileData) {
      profileData = await createProfileFromMetadata(session);
      if (!profileData) {
        profileData = createTemporaryProfile(session);
      }
    }

    return profileData;
  } catch (error) {
    console.error('💥 Error in profile fetch:', error);
    return createTemporaryProfile(session);
  }
};
