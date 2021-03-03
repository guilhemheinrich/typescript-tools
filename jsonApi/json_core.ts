import * as jsonpointer from 'json-pointer';
import { Transform } from 'stream'

namespace jsonapi {
    /**
      * Project a JavaScript object following a projection pattern.
      * @param data The JavaScript object to be projected.
      * @param projection An array of valid json pointer to project data upon.
      * @return The newly created projected object.
      */
    export function project(data: {}, projection: Array<string>) {
        let out = {}
        projection.forEach((key) => {
            if (jsonpointer.has(data, key)) {
                jsonpointer.set(out, key, jsonpointer.get(data, key));
            }
        })
        return out;
    }
    
    /**
      * Flattify a JavaScript object, following the json-pointer key mapping.
      * @param data The JavaScript object to be flattified.
      * @return The newly created flattified object.
      */
    export function flatten(data: {}) {
        let flattened_data = {}
        let tmp_data = jsonpointer.dict(data)
        for (let key of Object.keys(tmp_data)) {
            flattened_data[jsonpointer.unescape(key)] = tmp_data[key]
        }
        return flattened_data;
    }
    
    /**
      * Unflattify a JavaScript object, following the json-pointer key mapping.
      * @param data The JavaScript object to be unflattified.
      * @return The newly created unflattified object.
      */
    export function unflatten(data: { [pointer: string]: any }) {
        let out = {}
        Object.keys(data).forEach((pointer) => {
            jsonpointer.set(out, pointer, data[pointer])
        })
        return out
    }
    
    /**
      * Rename the propreties of a Javascript object.
      * @param data The JavaScript object to be rekeyed.
      * @param recipes An array of valid pair json pointer / newPropertyName to rename.
      * @return The modified object object.
      * @remarks This function alter the orginal object, and doesn't create a new one !
      */
    export function rekey(data: {}, recipes: Array<{ pointer: string, newPropertyName: string | number }>) {
        // let out = JSON.parse(JSON.stringify(data));
        let out = data;
        recipes.forEach((recipe) => {
            if (jsonpointer.has(data, recipe.pointer)) {
                let value = jsonpointer.get(data, recipe.pointer)
                jsonpointer.remove(out, recipe.pointer);
                let newPointer = jsonpointer.parse(recipe.pointer);
                newPointer.pop()
                newPointer.push(String(recipe.newPropertyName))
                jsonpointer.set(out, jsonpointer.compile(newPointer), value);
            }
        })
        return out;
    }
    
    
    export function propertiesDifference(object1: {}, object2: {}) {
        let summary: {
            properties_only_in_object_1: {[property_name: string]: any},
            properties_only_in_object_2: {[property_name: string]: any},
            common_properties: {[property_name: string]: any},
        } = {
            properties_only_in_object_1: {},
            properties_only_in_object_2: {},
            common_properties: {},
        }


        const compareProperty = (item_1: any, item_2: any, property_name_path: string[]) => {
            if (jsonpointer.has(item_1, jsonpointer.compile(property_name_path)) && !jsonpointer.has(item_2, jsonpointer.compile(property_name_path))) {
                jsonpointer.set(summary.properties_only_in_object_1, jsonpointer.compile(property_name_path), item_1)
                return
            } else if (jsonpointer.has(item_2, jsonpointer.compile(property_name_path)) && !jsonpointer.has(item_1, jsonpointer.compile(property_name_path))) {
                jsonpointer.set(summary.properties_only_in_object_2, jsonpointer.compile(property_name_path), item_2)
                return
            }
            let prop_value_1 = jsonpointer.get(item_1, jsonpointer.compile(property_name_path))
            let prop_value_2 = jsonpointer.get(item_2, jsonpointer.compile(property_name_path))
            if (Array.isArray(prop_value_1) && Array.isArray(prop_value_2)) {
                // Compare values in the arrays and signify differences
                let diff_1_minus_2 = prop_value_1.filter(x => !prop_value_2.includes(x)) // {1}\{2}
                let diff_2_minus_1 = prop_value_2.filter(x => !prop_value_1.includes(x)) // {2}\{1}
                let intersect = prop_value_2.filter(x => prop_value_1.includes(x))       // {1}∩{2}
                if (diff_1_minus_2.length > 0) {
                    jsonpointer.set(summary.properties_only_in_object_1, jsonpointer.compile(property_name_path), diff_1_minus_2)
                }
                if (diff_2_minus_1.length > 0) {
                    jsonpointer.set(summary.properties_only_in_object_2, jsonpointer.compile(property_name_path), diff_2_minus_1)
                }
                if (intersect.length > 0) {
                    jsonpointer.set(summary.common_properties, jsonpointer.compile(property_name_path), intersect)
                }
            } else if (prop_value_1 instanceof Object && prop_value_2 instanceof Object) {
                let properties_only_in_1 = Object.keys(prop_value_1).filter(x => !Object.keys(prop_value_2).includes(x)) // Properties({1}\{2})
                let properties_only_in_2 = Object.keys(prop_value_2).filter(x => !Object.keys(prop_value_1).includes(x)) // Properties({2}\{1})
                let common_properties = Object.keys(prop_value_2).filter(x => Object.keys(prop_value_1).includes(x))     // Properties({1}∩{2})
                if (properties_only_in_1.length > 0) {
                    let data = project(prop_value_1, properties_only_in_1)
                    jsonpointer.set(summary.properties_only_in_object_1, jsonpointer.compile(property_name_path), data)
                }
                if (properties_only_in_2.length > 0) {
                    let data = project(prop_value_2, properties_only_in_2)
                    jsonpointer.set(summary.properties_only_in_object_2, jsonpointer.compile(property_name_path), data)
                }
                // Iterate over common properties
                for (let common_property of common_properties) {
                    compareProperty(item_1, item_2, [...property_name_path, common_property])
                }
            } else if (prop_value_1 instanceof Object && !(prop_value_2 instanceof Object) 
            || prop_value_2 instanceof Object && !(prop_value_1 instanceof Object) ) {
                // Different structures: stop recursive propagation and signify differences
                jsonpointer.set(summary.properties_only_in_object_1, jsonpointer.compile(property_name_path), prop_value_1)
                jsonpointer.set(summary.properties_only_in_object_2, jsonpointer.compile(property_name_path), prop_value_2)
            } else if (prop_value_1 !== prop_value_2) {
                // Signify differences
                jsonpointer.set(summary.properties_only_in_object_1, jsonpointer.compile(property_name_path), prop_value_1)
                jsonpointer.set(summary.properties_only_in_object_2, jsonpointer.compile(property_name_path), prop_value_2)
            } else {
                // Signify equality
                jsonpointer.set(summary.common_properties, jsonpointer.compile(property_name_path), prop_value_1)
            }      
        }

        let allProperties = new Set([...Object.keys(object1), ...Object.keys(object2)])
        for (let property_name of allProperties) {
            compareProperty(object1, object2, [property_name])
        }
        return summary
    }



    export function transform< OUT>(data: {}, transformFunction: (value: any) => OUT, pointer?: string) {
        if (pointer !== undefined) {
            return transformFunction(jsonpointer.get(data, pointer));
        } else {
            return transformFunction(data)
        }
    }
    
    export function streamProject(projection: Array<string>) {
        return new Transform({
            objectMode: true,
            transform: (object: {}, encoding: string, callback: Function) => {
                let data = project(object, projection);
                callback(null, data);
            }
        })
    }
    
    export const streamFlatten = new Transform({
            objectMode: true,
            transform: (object: {}, encoding: string, callback: Function) => {
                let data = flatten(object);
                callback(null, data);
            }
        })
    
    export const streamUnflatten = new Transform({
            objectMode: true,
            transform: (object: {}, encoding: string, callback: Function) => {
                let data = unflatten(object);
                callback(null, data);
            }
        })
    
    export function streamRekey(recipes: Array<{ pointer: string, newPropertyName: string | number }>) {
        return new Transform({
            objectMode: true,
            transform: (object: {}, encoding: string, callback: Function) => {
                let data = rekey(object, recipes);
                callback(null, data);
            }
        })
    }

    export function streamTransform<OUT>( transformFunction: (value: any) => OUT, pointer?: string) {
        let out_stream = new Transform({
            objectMode: true,
            transform: (object: {}, encoding: string, callback: Function) => {
                let data = transform(object, transformFunction, pointer);
                callback(null, data);
            }
        })
        // out_stream.on('end', () => {
        //     console.log('end transform')
        // })
        return out_stream
    }
}

export default jsonapi