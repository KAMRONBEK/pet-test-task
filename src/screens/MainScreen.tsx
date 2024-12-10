import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { usePetContext } from "../context/PetContext";
import { Pet } from "../types";

export const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  age: Yup.number()
    .typeError("Age must be a number")
    .positive("Age must be a positive number")
    .required("Age is required"),
  description: Yup.string(),
});

const MainScreen: React.FC = () => {
  const { addPet, updatePet, deletePet, pets } = usePetContext();
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filterOption, setFilterOption] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const handleImagePicker = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to allow access to the photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFieldValue("photo", result.assets[0].uri);
    }
  };

  const handleSubmit = (
    values: { name: string; age: string; description: string; photo?: string },
    resetForm: () => void
  ) => {
    const petData: Pet = {
      id: editingPet?.id || Date.now().toString(),
      name: values.name.trim(),
      age: values.age.trim(),
      description: values.description.trim(),
      photo: values.photo,
    };

    if (editingPet) {
      updatePet(petData);
    } else {
      addPet(petData);
    }

    resetForm();
    setEditingPet(null);
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSearch = pet.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesFilter =
      filterOption === "all" ||
      (filterOption === "young" && parseInt(pet.age) < 5) ||
      (filterOption === "adult" && parseInt(pet.age) >= 5);

    return matchesSearch && matchesFilter;
  });

  const initialValues = { name: "", age: "", description: "", photo: "" };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search pets by name"
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />

      <DropDownPicker
        open={open}
        value={filterOption}
        items={[
          { label: "All Pets", value: "all" },
          { label: "Young (Age < 5)", value: "young" },
          { label: "Adult (Age >= 5)", value: "adult" },
        ]}
        setOpen={setOpen}
        setValue={setFilterOption}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          errors,
          touched,
          setFieldValue,
          handleBlur,
        }) => (
          <>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Pet Name"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Pet Age"
                value={values.age}
                onChangeText={handleChange("age")}
                onBlur={handleBlur("age")}
                keyboardType="numeric"
              />
              {touched.age && errors.age && (
                <Text style={styles.errorText}>{errors.age}</Text>
              )}

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Pet Description"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                multiline
                numberOfLines={4}
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleImagePicker(setFieldValue)}
              >
                <Text style={styles.buttonText}>Upload Photo</Text>
              </TouchableOpacity>

              {values.photo && (
                <Image
                  source={{ uri: values.photo }}
                  style={styles.imagePreview}
                />
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit as () => void}
              >
                <Text style={styles.buttonText}>
                  {editingPet ? "Update Pet" : "Add Pet"}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredPets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.petItem}>
                  {item.photo && (
                    <Image
                      source={{ uri: item.photo }}
                      style={styles.petImage}
                    />
                  )}
                  <Text>Name: {item.name}</Text>
                  <Text>Age: {item.age}</Text>
                  {item.description && (
                    <Text>Description: {item.description}</Text>
                  )}

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      onPress={() => setEditingPet(item)}
                      style={styles.editButton}
                    >
                      <Text>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Confirm Delete",
                          "Are you sure you want to delete this pet?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => deletePet(item.id),
                            },
                          ]
                        )
                      }
                      style={styles.deleteButton}
                    >
                      <Text>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 50,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownContainer: {
    backgroundColor: "#fafafa",
  },
  formContainer: {
    padding: 16,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 5,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 5,
  },
  petItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  petImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
});

export default MainScreen;
