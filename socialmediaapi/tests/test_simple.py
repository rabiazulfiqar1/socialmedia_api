# # Example dictionary
# person = {"name": "Alice", "age": 25, "city": "London"}

# # Get key-value pairs
# items_view = person.items()
# print(items_view)  # dict_items([('name', 'Alice'), ('age', 25), ('city', 'London')])

# # Iterate over key-value pairs
# for key, value in person.items():
#     print(f"{key} → {value}")

# # Dynamic update demonstration
# person["age"] = 26
# print(items_view)  # dict_items([('name', 'Alice'), ('age', 26), ('city', 'London')])

# def test_dict_contains():
#     x = {"a": 1, "b": 2}
#     expected = {"a": 1}
#     assert expected.items() <= x.items()
    
#share data between multiple tests: fixtures