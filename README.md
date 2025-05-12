# **Setup Chamber and Fetch SSM Parameters GitHub Action**

# chamber-aws-ssm-parameter-store
This GitHub Action sets up **Chamber**, retrieves AWS **SSM parameters**, and exports them as environment variables in your workflow. It helps you securely manage and use AWS SSM parameters like database credentials, API keys, or other secrets within your CI/CD pipeline. You can also customize how parameters are mapped to environment variables.

## **Overview**

This GitHub Action allows you to easily integrate **AWS SSM** parameters into your workflows. By utilizing **Chamber**, it retrieves SSM parameters, and you can choose how to name the environment variables. The action also supports **namespacing**, where you can have environment variables prefixed by their SSM parameter path, or you can opt for a simpler name that only uses the parameter’s name.

You can inject AWS credentials directly via environment variables or GitHub secrets, and the action will handle setting up **Chamber** for you automatically.

---

## **Features**

* **Automatic Chamber Setup**: If **Chamber** is not already installed, the action will automatically download and install the required version.
* **Fetch SSM Parameters**: Fetch SSM parameters from AWS Parameter Store securely using **Chamber**.
* **Environment Variable Export**: The fetched parameters are automatically exported as environment variables in your workflow.
* **Customizable Namespacing**: You can choose to add a prefix (namespace) to environment variables or just use the parameter name.
* **Flexible Custom Mappings**: Map SSM parameter names to custom environment variable names.
* **AWS Credential Handling**: AWS credentials can be configured either through the GitHub environment or by directly passing them as inputs.

---

## **Inputs**

| **Input**               | **Description**                                                                                                                                             | **Required** | **Default**                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------- |
| `parameters`            | List of SSM parameters with optional custom environment variable mappings (e.g., `"/my-app/db-password:MY_DB_PASSWORD"`).                                   | Yes          | N/A                         |
| `namespaced`            | Determines if the environment variable will include the namespace from the parameter path. `true` uses the namespace, `false` uses just the parameter name. | No           | `true`                      |
| `aws-region`            | AWS region where your SSM parameters are stored.                                                                                                            | No           | `us-east-1`                 |
| `aws-access-key-id`     | AWS access key ID for authentication.                                                                                                                       | No           | (via environment variables) |
| `aws-secret-access-key` | AWS secret access key for authentication.                                                                                                                   | No           | (via environment variables) |
| `chamber_version`       | Version of **Chamber** to install. If not specified, defaults to `latest`.                                                                                  | No           | `latest`                    |

---

## **What This Action Does for You**

### **1. Fetch AWS SSM Parameters**

This action retrieves your SSM parameters securely from **AWS SSM Parameter Store**. You simply provide a list of parameters to fetch, and the action will use **Chamber** to retrieve them.

For example, if you specify `/my-app/db-password`, it will fetch the corresponding value from AWS SSM.

### **2. Export Parameters as Environment Variables**

Once the parameters are fetched, the action automatically exports them as environment variables for use in subsequent steps in your GitHub Actions workflow. These parameters can then be used by other steps in your CI/CD pipeline, such as deploying your app or connecting to databases.

### **3. Namespacing Control**

You can control how your parameters are exported:

* **Namespaced**: If `namespaced: true`, the environment variables will be prefixed by the first part of the parameter’s path (e.g., `MY_APP_DB_PASSWORD` for the parameter `/my-app/db-password`).
* **Non-namespaced**: If `namespaced: false`, the environment variable will use only the parameter name (e.g., `DB_PASSWORD`).

This allows you to control how the variables are named based on your needs or naming conventions.

### **4. Custom Environment Variable Names**

If needed, you can specify custom names for each parameter's corresponding environment variable. For example, you can fetch `/my-app/db-password` from SSM and map it to an environment variable like `MY_DB_PASSWORD`.

### **5. Seamless AWS Credential Handling**

AWS credentials are required to fetch parameters from AWS SSM. This action supports:

* **AWS Credentials via GitHub Secrets**: If you're using **GitHub secrets** to store your credentials, the action will automatically use them (via the `aws-access-key-id` and `aws-secret-access-key` inputs, or through the environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`).
* **AWS Credential Setup Action**: We recommend using the [**`aws-actions/configure-aws-credentials`**](https://github.com/aws-actions/configure-aws-credentials) GitHub Action for securely configuring your AWS credentials in your workflows.

---

## **How to Use the Action**

Below are examples of how you can integrate this action into your GitHub workflows.

### **Basic Example (Namespaced Variables)**

This example fetches the SSM parameters `/my-app/db-password` and `/another-service/api-key` and exports them as environment variables with namespaces:

```yaml
name: Fetch SSM Parameters

on:
  push:
    branches:
      - main

jobs:
  fetch-parameters:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Fetch SSM Parameters and Set as Env Vars
        uses: your-username/your-repo@v1
        with:
          parameters:
            - "/my-app/db-password"
            - "/another-service/api-key"
          namespaced: 'true'
```

* The parameters will be exported as `MY_APP_DB_PASSWORD` and `ANOTHER_SERVICE_API_KEY`.

### **Example with Custom Variable Mappings**

In this example, the action fetches the parameter `/my-app/db-password` from SSM but exports it with a custom name (`MY_DB_PASSWORD`):

```yaml
name: Fetch SSM Parameters

on:
  push:
    branches:
      - main

jobs:
  fetch-parameters:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Fetch SSM Parameters and Set as Env Vars
        uses: your-username/your-repo@v1
        with:
          parameters:
            - "/my-app/db-password:MY_DB_PASSWORD"
          namespaced: 'false'
```

* The fetched parameter will be exported as `MY_DB_PASSWORD` instead of `MY_APP_DB_PASSWORD`.

### **Example with Custom Chamber Version**

You can specify the version of **Chamber** to install, ensuring you use a version compatible with your requirements.

```yaml
name: Fetch SSM Parameters with Custom Chamber Version

on:
  push:
    branches:
      - main

jobs:
  fetch-parameters:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Fetch SSM Parameters and Set as Env Vars
        uses: your-username/your-repo@v1
        with:
          parameters:
            - "/my-app/db-password"
          chamber_version: '0.7.0'
          namespaced: 'true'
```

### **Example with Disabled Namespacing**

You can disable namespacing and just use the parameter names as environment variables:

```yaml
name: Fetch SSM Parameters with Disabled Namespacing

on:
  push:
    branches:
      - main

jobs:
  fetch-parameters:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Fetch SSM Parameters and Set as Env Vars
        uses: your-username/your-repo@v1
        with:
          parameters:
            - "/my-app/db-password"
            - "/another-service/api-key"
          namespaced: 'false'
```

* The parameters will be exported as `DB_PASSWORD` and `API_KEY` without any prefixes.

---

## **Handling AWS Credentials**

### **Recommended Setup with `aws-actions/configure-aws-credentials`**

It is recommended to use the [**`aws-actions/configure-aws-credentials`**](https://github.com/aws-actions/configure-aws-credentials) GitHub Action to securely configure your AWS credentials. Here is an example:

```yaml
- name: Set up AWS credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}
```

### **AWS Credentials via Action Inputs or Environment Variables**

You can also pass AWS credentials directly as inputs to this action, such as `aws-access-key-id`, `aws-secret-access-key`, and `aws-region`. If these inputs are not provided, the action will look for the corresponding environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) to configure the AWS CLI.

---

## **License**

This GitHub Action is licensed under the **MIT License**.

---

## **Conclusion**

This GitHub Action simplifies the process of securely retrieving and using AWS SSM parameters in your CI
