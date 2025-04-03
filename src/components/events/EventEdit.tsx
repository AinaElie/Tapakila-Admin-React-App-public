import { Edit, SimpleForm, TextInput, DateTimeInput, required, useRecordContext, TopToolbar, ShowButton, useInput, NumberInput } from 'react-admin';
import { Box } from '@mui/material';
import CloudinaryUpload from './ImageInput';

const EventTitle = () => {
    const record = useRecordContext();
    return <span>Modifier {record?.event_name || "l'événement"}</span>;
};

const EventActions = () => (
    <TopToolbar>
        <ShowButton />
    </TopToolbar>
);



export const EventEdit = () => {
    return (
        <Edit 
            title={<EventTitle />}
            actions={<EventActions />}
            mutationMode="pessimistic"
        >
            <Box sx={{ p: 2 }}>
                <SimpleForm
                    sx={{
                        '& .RaSimpleForm-form': {
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                            gap: 3
                        }
                    }}
                >
                    {/* Nom de l'événement (sur 3 colonnes) */}
                    <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 3' } }}>
                        <TextInput
                            source="event_name"
                            label="Nom de l'événement"
                            validate={[required()]}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                    </Box>

                    {/* Trois champs en ligne */}
                    <DateTimeInput
                        source="event_date"
                        label="Date et heure"
                        validate={[required()]}
                    />

                    <TextInput
                        source="event_place"
                        label="Lieu"
                        validate={[required()]}
                    />

                    <TextInput
                        source="event_category"
                        label="Catégorie"
                        validate={[required()]}
                    />

                    {/* Deux champs en ligne */}
                    <TextInput
                        source="event_organizer"
                        label="Organisateur"
                        validate={[required()]}
                    />

                    <TextInput
                        source="event_description"
                        label="Description"
                        validate={[required()]}
                        multiline
                        rows={4}
                        fullWidth
                        sx={{ gridColumn: { xs: '1', sm: '2 / span 2' }, mb: 2 }}
                    />

                    <NumberInput
                        source="event_tickets_limit_by_user_by_type"
                        label="Nombre de billets par utilisateur par type"
                        validate={[required()]}
                    />

                    {/* Informations supplémentaires (sur 3 colonnes) */}
                    <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 3' } }}>
                        <TextInput
                            source="additional_info"
                            label="Informations supplémentaires"
                            multiline
                            rows={4}
                            fullWidth
                        />
                    </Box>

                    {/* Upload d'image (sur 3 colonnes) */}
                    <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 3' } }}>
                        <CloudinaryUpload source="event_image" />
                    </Box>
                </SimpleForm>
            </Box>
        </Edit>
    );
};


