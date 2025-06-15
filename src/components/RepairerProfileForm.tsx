
import React from 'react';
import RepairerProfileFormMain from './repairer-profile/RepairerProfileFormMain';
import { RepairerProfileFormProps } from '@/types/repairerProfile';

const RepairerProfileForm: React.FC<RepairerProfileFormProps> = (props) => {
  return <RepairerProfileFormMain {...props} />;
};

export default RepairerProfileForm;
