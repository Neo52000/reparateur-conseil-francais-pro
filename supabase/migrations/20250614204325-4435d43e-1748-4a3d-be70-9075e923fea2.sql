
-- Créer le compte admin de manière plus simple
DO $$
DECLARE
    user_id uuid;
    existing_user_id uuid;
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'reine.elie@gmail.com';
    
    IF existing_user_id IS NULL THEN
        -- L'utilisateur n'existe pas, le créer
        user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            user_id,
            'authenticated',
            'authenticated',
            'reine.elie@gmail.com',
            crypt('Rpadfhq3@52', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"first_name":"Reine","last_name":"Elie","role":"admin"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    ELSE
        -- L'utilisateur existe, mettre à jour le mot de passe
        user_id := existing_user_id;
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('Rpadfhq3@52', gen_salt('bf')),
            raw_user_meta_data = '{"first_name":"Reine","last_name":"Elie","role":"admin"}',
            updated_at = now()
        WHERE id = user_id;
    END IF;

    -- Créer ou mettre à jour le profil
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (user_id, 'reine.elie@gmail.com', 'Reine', 'Elie', 'admin')
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        first_name = 'Reine',
        last_name = 'Elie',
        updated_at = now();
END $$;
